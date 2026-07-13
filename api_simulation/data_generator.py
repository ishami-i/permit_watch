"""
this is for the data generator for the api simulation. 
this will be generating data that would be sent by real api to be used in the simulation.
1. generate_professionals()
    Engineer name
    Architect name
    Surveyor name
    Engineer license number
    Architect license number
    Surveyor certification number
    Verification records from professional regulatory boards
2. generate_applicants()
    Full name
    National ID or passport number
    Contact information (phone number, email address)
    Proof of property ownership
3. generate_properties()
    Land Data
        Unique Parcel Identifier (UPI)
        Physical address
        GIS coordinates (latitude and longitude)

    Zoning and Restrictions
        Land use classification
        Permitted building rights
        Environmental protection boundaries
        Urban planning restrictions

5. generate_permits()
    Status Tracking
        Submitted
        Under review
        Fees invoiced
        Approved
        Rejected

    Timeline Metrics
        Submission date
        Review duration
        Approval date
        Permit issuance date
        Permit expiration date

    Inspection Records
        Site inspection logs
        Compliance reports
        Violation notices
        Corrective actions
6. generate_inspections()
7. generate_tax_records()
    Tax Status
        Property tax clearance
        Corporate tax compliance records
        Outstanding tax obligations

    Environmental and Business Clearances
        Environmental Impact Assessment (EIA) approvals
        Business licenses
        Other regulatory approvals

"""