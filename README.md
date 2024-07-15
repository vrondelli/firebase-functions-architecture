### README.md

---

# Arquitetura para firebase functions

## Visão Geral

Este projeto tem como objetivo criar uma arquitetura escalável utilizando Firebase Functions e Firestore. A solução inclui:

- Funções HTTP para criar registros no Firestore.
- Triggers do Firestore para incrementar IDs automaticamente ao criar novos registros.
- Testes automatizados para garantir o funcionamento correto do sistema.

## Estrutura de Pastas

```
project-root/
│
├── functions/
│   ├── lib/
│   ├── node_modules/
│   ├── src/
│   │   ├── framework/
│   │   │   ├── handlerFactory.ts
│   │   │   ├── module.ts
│   │   │   └── repositoryFactory.ts
│   │   ├── records/
│   │   │   ├── assemblers/
│   │   │   │   └── requestAssemblers.ts
│   │   │   ├── handlers/
│   │   │   │   └── createRecord.ts
│   │   │   ├── repositories/
│   │   │   │   └── recordsRepository.ts
│   │   │   ├── services/
│   │   │   │   └── recordsService.ts
│   │   │   ├── validators/
│   │   │   │   └── requestValidator.ts
│   │   │   └── recordsModule.ts
│   │   ├── res/
│   │   │   └── errorMessage.ts
│   │   ├── test/
│   │   │   ├── config/
│   │   │   │   ├── testSetup.ts
│   │   │   │   ├── testUtils.ts
│   │   │   ├── records/
│   │   │   │   ├── createRecord.test.ts
│   │   │   │   ├── recordSetIncrementId.test.ts
│   │   │   └── testRunner.ts
│   │   └── index.ts
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── .mocharc.json
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.dev.json
│   ├── tsconfig.json
├── .firebaserc
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── Dockerfile
├── docker-compose.yml
├── README.md
```

## Instalação e Execução

2. **Instale as dependências:**

   ```bash
   cd functions/
   npm install
   ```

3. **Emule o Firebase:**

   Siga a documentação do Firebase para configurar e emular o ambiente:
   [Documentação do Emulador do Firebase](https://firebase.google.com/docs/functions/local-emulator)

4. **Execute o emulador do Firebase:**

   ```bash
   firebase emulators:start
   ```

## Rodando com Docker

1. **Build e execute os containers Docker:**

   ```bash
   docker compose up --build
   ```

   Este comando vai construir as imagens Docker e iniciar o emulador do Firestore.

2. **Verifique se o emulador do Firestore está rodando:**

   Acesse a UI do emulador em http://localhost:4000/.

## Executando Testes

1. **Certifique-se de que o emulador do Firestore está rodando:**

   ```bash
   docker compose up -d firebase-emulator
   ```

2. **Execute os testes:**

   ```bash
   cd functions/
   npm install
   npm run test
   ```

   Este comando vai rodar os testes unitários usando Mocha.

## Handler Factories

O projeto utiliza o padrão Factory para a criação de handlers e triggers, facilitando a escalabilidade e a manutenção do código.

### HTTP Handler Factory

O `HttpHandlerFactory` cria handlers HTTP para Firebase Functions:

```typescript
export const HttpHandlerFactory = <T, K>(
  method: HttpMethods, 
  handler: HandlerFunction<T, K>, 
  validator: HttpValidator, 
  assembler: HttpRequestAssembler<K>
): HttpsFunction => {
  return onRequest(async (req: Request, res: Response) => {
    if (req.method !== method) res.status(405).send("Method Not Allowed");
    try {
      logger.info("Request received", { request: req });
      validator(req);
      const request = assembler(req);
      const response = await handler(request);
      logger.info("Response sent", { response });
      res.status(200).json(response);
    } catch (error: any) {
      logger.error("Error occurred", { error });
      res.status(error.httpCode).json(error);
    }
  });
};
```

### Callable Handler Factory

O `CallableHandlerFactory` cria handlers callable para Firebase Functions:

```typescript
export const CallableHandlerFactory = <T, K>(
  handler: HandlerFunction<T, K>, 
  validator: CallableValidator, 
  assembler: CallableRequestAssembler<K>, 
  requireAuth: boolean = true
): HttpsFunction => {
  return onCall(async (request: CallableRequest<K>) => {
    if (requireAuth && !request.auth) {
      logger.error('Authentication required');
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    try {
      logger.info("Request received", { request });
      validator(request);
      const response = await handler(assembler(request));
      logger.info("Response sent", { response });
      return response;
    } catch (error: any) {
      logger.error("Error occurred", { error });
      throw new HttpsError('internal', error.message, error);
    }
  });
};
```

Essas factories tornam os handlers agnósticos ao passar o validador e o montador de requisição para a factory, facilitando a mudança para o callable handler.

## Injeção de Dependência

O projeto usa injeção de dependência para facilitar testes unitários dos serviços. Ao injetar dependências, como o banco de dados Firestore e repositórios, nos serviços, torna-se mais fácil mockar essas dependências nos testes.

### Exemplo de Serviço com Injeção de Dependência

```typescript
export const RecordService = (recordRepository: RecordRepository): RecordService => {
  const createRecord = async (createRecordRequest: CreateRecordRequest): Promise<Record> => {
    try {
      const record = await recordRepository.create(createRecordRequest);
      return record;
    } catch (error: any) {
      console.log(`Record Service Error: creating record: ${error.message}`);
      throw errorMessage.internalError;
    }
  };

  return {
    createRecord,
  };
};
```

## Estrutura do Projeto

Esta estrutura de projeto organiza o código em módulos lógicos, facilitando o gerenciamento e a escalabilidade. Cada módulo é auto-contido, com seus próprios handlers, serviços e testes.

---