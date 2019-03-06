const express = require('express')
const morgan = require('morgan')
const health = require('@cloudnative/health-connect')
let healthcheck = new health.HealthChecker()
const app = express()

app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(morgan('combined'))

app.get('/', (req, res) => res.render('index'))
app.get('/health', health.LivenessEndpoint(healthcheck))
app.get('/ready', health.ReadinessEndpoint(healthcheck))

app.listen(3000, () => console.log(`Sample app started on port 3000`))