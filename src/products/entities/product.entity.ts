import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '094d7304-3918-40b4-a42c-83f02e8f0547',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;
  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', { default: 0 })
  price: number;
  @ApiProperty({
    example:
      'Inspired by our popular home battery, the Tesla Powerwall Tee is made from 100% cotton',
    description: 'Product Description',
    default: null,
  })
  @Column({ type: 'text', nullable: true })
  description: string;
  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product SLUG - for SEO routes',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;
  @ApiProperty({
    example: 10,
    description: 'Product Stock',
    default: 0,
  })
  @Column('int', { default: 0 })
  stock: number;
  @ApiProperty({
    example: ['M', 'XL', 'L'],
    description: 'Product Sizes',
  })
  @Column('text', { array: true })
  sizes: string[];
  @ApiProperty({
    example: 'women',
    description: 'Product Gender',
  })
  @Column('text')
  gender: string;
  @ApiProperty()
  @Column('text', { array: true, default: [] })
  tags: string[];
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  //eager: -> Cuando realizamos algun find nos traiga la relacion
  @ApiProperty()
  images?: ProductImage[];
  @ManyToOne(() => User, (user) => user.product, {
    eager: true,
  })
  user: User;

  //modifica la data antes de insertar
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.parseSlug();
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.parseSlug();
  }

  parseSlug() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
