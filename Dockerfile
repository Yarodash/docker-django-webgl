FROM python:3.9
RUN  python -m pip install --upgrade pip
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt
COPY ./webgl /app/webgl
CMD python app/webgl/manage.py runserver 0.0.0.0:8000
