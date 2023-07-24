export class CustomExceptionDto {
  message: string;
  property: string;
}

export class CustomException {
  message: string;
  property: string;

  constructor(payload: CustomExceptionDto) {
    this.message = payload.message;
    this.property = payload.property;
  }
}
