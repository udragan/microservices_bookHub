- in terminal run:
python -m venv venv
source venv/bin/activate 	// linux
> venv/Scripts/activate		// win
> pip install -r requirements.txt

- run service (from root folder):
> uvicorn app.main:app --port 8003 --reload


- create migration
    before creating migration make sure that all the needed models are imported explicitly into db/alembic/env.py !!
> alembic revision --autogenerate -m "migration description"
> alembic upgrade head
