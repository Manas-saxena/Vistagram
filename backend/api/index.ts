import serverless from 'serverless-http'
import app from '../src/app'   // make sure app.ts exports `export default app`
export default serverless(app)