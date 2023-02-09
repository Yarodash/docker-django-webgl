## Quick guide
All images, js scripts with shaders stored in `static` folder.

### Docker build & run:
```console
docker build . --tag django-webgl-app
docker run --rm -it -v $pwd/static:/app/static -p 8000:8000/tcp django-webgl-app
```

### Go to 127.0.0.1:8000 in browser