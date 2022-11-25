import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (propertyHeader: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const headers = req.rawHeaders;
    return !propertyHeader ? headers : headers[propertyHeader];
  },
);
