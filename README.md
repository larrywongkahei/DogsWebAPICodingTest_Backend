# Dogs web api coding test (Backend)
 I have included .env file as well, for easier to start.
## MVP
- Basic GET, POST, PUT, DELETE endpoints
- Login logics
- ... Yet to decide

## Features
1. Login / Register
2. Validate jwt token, default 30m(Set in .env or compose.yaml file)
3. Search for names
4. Filter initial
5. Remove dog
6. Add dog
7. Update dog
8. Change random image
9. Add description

## Ways to start using this project
1. Docker
 To Start with Docker, create a folder and then run <code>docker volume create data && git clone https://github.com/larrywongkahei/DogsWebAPICodingTest_Backend.git && git clone https://github.com/larrywongkahei/DogsWebAPICodingTest.git && mv ./DogsWebAPICodingTest/compose.yaml .&&docker compose up</code> After that, you can go to your broswer and type in [localhost](http://localhost) and enter. Enjoy
2. Start up separately, Frontend and Backend
 To start with this approach, clone my frontend and backend first, then within my **Frontend** directory, run <code>npm install && npm run dev</code>. then go into my **Backend** directory, run <code>mkdir data && npm install && npm run start</code>. Enjoy.  
3. Visit my oracle instance that running this project. [Press me](http://130.162.172.61/)

## Tutorial
### Work flow: 
1. Go visit the link
2. It would direct you to Login page.
3. Register then it would direct you to login page
4. Login
5. You can then search for name, filter initial and create dog ( it would verify with dog ceo api, so it can't be a make up name or dogs that are not listed on dog ceo api )
6. If the dog has sub breed, you can see when you click into the dog image. You can also delete and add description when you are in the dog profile.

## Something funny

Credit to dog ceo.
[Link to github](https://dog.ceo/dog-api/)

I accidentally found something like the source of the dog list when searching for ways to get dog image by name. haha
