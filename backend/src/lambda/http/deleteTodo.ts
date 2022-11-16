import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { createLogger } from '../../utils/logger'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info("Path parameters", event.pathParameters)
    
    const userId = getUserId(event)

    
    // TODO: Remove a TODO item by id

    await deleteTodo(userId, todoId) 

   
    logger.info("Todo deleted successfully")
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "todo deleted successfully"
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
