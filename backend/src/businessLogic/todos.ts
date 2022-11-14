
import * as uuid from 'uuid'
const  AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')
import { APIGatewayProxyEvent } from "aws-lambda";

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../helpers/todosAcess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { getUserId } from '../lambda/utils'



const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })


const todoAccess = new TodoAccess();

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const todosTable = process.env.TODOS_TABLE
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    event: APIGatewayProxyEvent,
    ): Promise<TodoItem> {

    const itemId = uuid.v4()
    const userId = getUserId(event)
    const date = new Date().toISOString()

    return  await todoAccess.createTodo({
        "userId": userId,
        "todoId": itemId,
        "createdAt": date,
        "name": createTodoRequest.name,
        "dueDate": createTodoRequest.dueDate,
        "done": false,
        "attachmentUrl":`https://${bucketName}.s3.amazonaws.com/${itemId}`,
       })




}
export async function deleteTodo(todoId: string) {
    const result = await docClient.delete({
        TableName: todosTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        },
        ScanIndexForward: false
      }).promise()
    
      return result.Items
} 

export async function createAttachmentPresignedUrl(todoId: string) {
    return await s3.getSignedUrl('putObject', {
        Bucket: todosTable,
        Key: todoId,
        Expires: urlExpiration
      })
}

export async function getTodosForUser(userId: string) {
        const result = await docClient.query({
          TableName: todosTable,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          },
          ScanIndexForward: false
        }).promise()
      
        return result.Items
      }