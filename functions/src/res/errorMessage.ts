export default {
  internalError: {
    message: 'Internal error',
    code: 1,
    httpCode: 500,
  },
  fieldRequired: (field: string) => ({
    message: `Field ${field} is required`,
    code: 2,
    httpCode: 400,
  }),
  
}