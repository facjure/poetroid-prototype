## Poetroid Web

### API

OAuth:

  TBD: github, twitter

Poems:
- POST   /poem/ {new or updated body}
- GET    /poem/{short-title}
- GET    /poem/{short-title}/metadata/
- GET    /poem/{map-of-searchParams}

- DELETE /poem/{short-title}

- POST   /poem/{name}/tags {map-of-tagNames}
- GET    /poem/{name}/tags

Metadata:
- GET    /metadata/{search-params}
- GET    /metadata/top-{n} ;;n=5,10,20,50,100

Tags:
- GET   /poem

Collections:
- POST /collections/{name}/{poem-short-title}
- GET /collections/{name}

- GET /collections/{search-params}

Authors:
- GET /authors/{name}
- GET /authors/top-{x} ;;n=5,10,20,50,100

### Usage

  lein run
