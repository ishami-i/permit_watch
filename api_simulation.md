# API Simulation
This system is based on the Kubaka system, which I do not have access to. To build the project, I am creating a simulation of how the APIs would behave if they were available.

## How it’s built

There will be a script that continuously generates projects and makes them behave as the system would if it had the Kubaka API in place. It will also include FastAPI endpoints to activate the simulation.

## File structure
api_simulation/
.
├── api_server.py
├── data_generator
│   ├── applicant.py
│   ├── environment_clearance.py
│   ├── inspection.py
│   ├── ownership_certificate.pdf
│   ├── permit.py
│   ├── professional.py
│   ├── project.py
│   ├── property.py
│   └── tax_record.py
├── data_generator.py
├── requirement.txt
├── sample_data
│   ├── location.json
│   ├── names.json
│   └── supervisors.json
└── transmit_data.py

3 directories, 16 files
