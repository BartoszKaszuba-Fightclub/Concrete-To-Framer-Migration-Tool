import { connect } from "framer-api"

const framer = await connect(
	"https://framer.com/projects/Spinning-Messages--kJ2Ihks3y2NZGTuibZtV-1e8vR?node=DEFOFkw0C", 
	process.env.FRAMER_TOKEN // Your previously created API key
)

const projectInfo = await framer.getProjectInfo()

console.log(`Project: ${projectInfo.name}`)

// Closes down the server API.
// If you don't do this, your script won't finish executing.
await framer.disconnect()