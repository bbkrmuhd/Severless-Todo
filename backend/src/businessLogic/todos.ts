
import * as uuid from 'uuid'
const  AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')
import { APIGatewayProxyEvent } from "aws-lambda";

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoAccess } from '../helpers/todosAcess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createLogger } from '../utils/logger'
import { getUserId } from '../lambda/utils'
// import { getSignedUrl } from '../helpers/attachmentUtils'


const logger = createLogger("business logic")



const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()

const todoAccess = new TodoAccess();

const todosTable = process.env.TODOS_TABLE
const indexTable = process.env.TODOS_CREATED_AT_INDEX

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    event: APIGatewayProxyEvent,
    ): Promise<TodoItem> {

    const todoId = uuid.v4()
    const userId = getUserId(event)
    const date = new Date().toISOString()
    logger.info("creating todo item")

    return  await todoAccess.createTodo({
        "userId": userId,
        "todoId": todoId,
        "createdAt": date,
        "name": createTodoRequest.name,
        "dueDate": createTodoRequest.dueDate,
        "done": false,
        "attachmentUrl": "",
       })




}
export async function deleteTodo(userId: string, todoId: string) {
    return await todoAccess.deleteTodo(userId, todoId)   
} 

export async function updateTodo (
  todoUpdate: UpdateTodoRequest, 
  todoId: string, 
  userId: string) {
  
  return todoAccess.updateTodo(todoUpdate, todoId, userId)   
}

export async function createAttachmentPresignedUrl(todoItem: TodoItem) {
  return await todoAccess.createAttachmentPresignedUrl(todoItem)
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


export async function getTodoById(todoId:string) :Promise<TodoItem>{ 

        logger.info("Getting a todo Item by todoId")
    
        const resultSet = await docClient.query({
          TableName: todosTable,
          IndexName: indexTable,
          KeyConditionExpression: 'todoId = :todoId',
          ExpressionAttributeValues:{
              ':todoId':todoId
          }
      }).promise()

        return resultSet.Items[0] as TodoItem
    }