import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      //alistamos el user a guardar
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: this.encriptPass(password),
      });
      await this.userRepository.save(user);
      //eliminamos la propiedad password, para que no se muestre
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    //buscamos el Password pues en la entidad no se va mostrar (findOneBy)
    const user = await this.userRepository.findOne({
      where: { email },
      select: { password: true, id: true },
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!this.validatePass(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)');

    return {
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAutStatus(user: User) {
    //eliminamos la propiedad password, para que no se muestre
    delete user.password;
    delete user.roles;
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  /**
   * Manejo de Errores de laq BBDD
   *
   * @param error
   */
  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException('Please chack server logs');
  }

  /**
   * Encriptamos la contraseña
   *
   * @param password
   * @returns  password encript
   */
  private encriptPass(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  private validatePass(password: string, oldPassword: string): boolean {
    return bcrypt.compareSync(password, oldPassword);
  }
}
