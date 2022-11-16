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
      private readonly  todosTable = process.env.TODOS_TABLE,
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) {
    }


    async deleteTodo(userId: string, todoId: string) {

      logger.info("Delete a Todo Item for todoId", todoId)

      const deleteTodoQuery = {
          TableName: this.todosTable,
          Key: {
              "userId": userId,
              "todoId": todoId
          },
      }
      await this.docClient.delete(deleteTodoQuery).promise()
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
      UpdateExpression: "set #na = :na, #du = :du, #do = :do",
      ExpressionAttributeNames: {
          "#na": "name",
          "#du": "dueDate",
          "#do": "done"
      },
      ExpressionAttributeValues:{
          ":na": todoUpdate.name,
          ":du" : todoUpdate.dueDate,
          ":do" : todoUpdate.done
      },
      ReturnValues: "ALL_NEW"
    }).promise()
    logger.info("Todo Item has been updated")
}
  
    async createAttachmentPresignedUrl(todoId: string, userId: string){
       const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        
      logger.info("Creating attachmentUrl for todoId ", todoId)

      const dbQuery = {
          TableName: this.todosTable,
          Key:{
              "todoId": todoId,
              "userId": userId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
              ':attachmentUrl': attachmentUrl
          }
      }

      logger.info("Todo attachmentUrl has been updated")
      await this.docClient.update(dbQuery).promise()
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
  