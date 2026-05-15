declare module '@hookform/resolvers/zod' {
  import { FieldValues, Resolver } from 'react-hook-form';
  export function zodResolver<T extends FieldValues>(schema: any, options?: object, resolverOptions?: object): Resolver<T>;
}
