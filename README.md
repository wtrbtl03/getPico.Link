# [getPico.Link](https://getPico.Link)
An elegant, minimum overhead and fully API-based URL Shortner.


## Project Stack

### Backend
- Django
- Whitenoise
- Nginx
- Gunicorn
### Frontend
- Tailwind CSS ( That's it :) )
### Database
- MongoDB ( Locally Hosted )
### External Services
- Google OAuth 2.0 : For user sign-in.


## API and Design Docs

Full API and design docs can be found [here](https://www.notion.so/saakaarbarthwal/PicoShare-link-Docs-42430501c2f04c48a8c0f169e9406e65).

### API Endpoints

| Method       | URI                               | Description                                                              |
| ------------ | --------------------------------- | ------------------------------------------------------------------------ |
| ```GET```    | ```/get/<longURL>/```             | Shortens the long URL and returns the shortened URL.                     |
| ```GET```    | ```/load/```                      | Fetches all custom URLs created by the authenticated user.               |
| ```POST```   | ```/custompico/<customPhrase>/``` | Enables an authenticated user to create a custom shortened URL.          |                                                              |
| ```PUT```    | ```/update/<customPhrase>/```     | Enables an authenticated user to modify a custom short URL they created. |
| ```DELETE``` | ```/delete/<customPhrase>/```     | Enables an authenticated user to delete a custom short URL they created. |


## Acknowledgements

[Coolicons Line Oval Icons](https://www.svgrepo.com/collection/coolicons-line-oval-icons/) by [krystonschwarze](https://www.svgrepo.com/author/krystonschwarze/) under [CC Attribution License](https://www.svgrepo.com/page/licensing/#CC%20Attribution) via [SVG Repo](https://www.svgrepo.com/).


## License

This project is under the [GPL v3 License](LICENSE).