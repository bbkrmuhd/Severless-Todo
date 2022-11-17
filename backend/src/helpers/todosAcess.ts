const  AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
// import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly  todosTable = process.env.TODOS_TABLE) {
    }


    async deleteTodo(userId: string, todoId: string) {

      logger.info("Delete a Todo Item for todoId", todoId)

      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
    }).promise()
      logger.info("Todo item with id of ", todoId, " has been deleted")
  }

  async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string) {

    logger.info("Updating a todo Item for todoId", todoId)
  
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId,
      },
      UpdateExpression: "set #todoName = :todoName, #dueDate = :dueDate, #done = :done",
      ExpressionAttributeNames: {
          "#todoName": "name",
          "#dueDate": "dueDate",
          "#done": "done"
      },
      ExpressionAttributeValues:{
          ":todoName": todoUpdate.name,
          ":dueDate" : todoUpdate.dueDate,
          ":done" : todoUpdate.done
      },
      ReturnValues: "ALL_NEW"
    }).promise()
    logger.info("Todo Item has been updated")
}
  
    async createAttachmentPresignedUrl(todo: TodoItem){
        
      logger.info("Creating attachmentUrl for todoId ", todo.todoId)
    
      await this.docClient.update({
        TableName: this.todosTable,
        Key:{
            todoId: todo.todoId,
            userId: todo.userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
            ':attachmentUrl': todo.attachmentUrl
        }
    }).promise()
    logger.info("Todo attachmentUrl has been updated")
  }
  
    async createTodo(todo: TodoItem): Promise<TodoItem> {
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todo
      }).promise()
  
      return todo
    }
    
  }
  
  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      logger.info('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  