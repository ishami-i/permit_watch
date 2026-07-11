# API Simulation
This system is based on the Kubaka system, which I do not have access to. To build the project, I am creating a simulation of how the APIs would behave if they were available.

## How it’s built

There will be a script that continuously generates projects and makes them behave as the system would if it had the Kubaka API in place. It will also include FastAPI endpoints to activate the simulation.

## File structure
 api_simulation/
├── data_generator.py      # Script to generate synthetic data
├── api_server.py          # FastAPI application simulating endpoints
├── transmit_data.py       # Script to call the API and send data
└── requirements.txt       # Dependencies involved
