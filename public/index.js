const socket = io();

const renderQuestions = async () => {
  const container = document.querySelector("#container");
  container.innerHTML = "";
  const response = await fetch(`/question`);
  console.log(response);
  let data = await response.json();
  console.log("dAtA",data);

  if (response.ok === true) {
    data.map(item => renderQuestion(item));
  }
}

const footer = document.querySelector(".footer");
const timerBox = document.createElement("h4");
timerBox.innerText = "0 sec"
footer.append(timerBox);

// let timerId;
// const countQuizTimeSpend = () => {
//   let start = 0;
//   timerBox.innerText = "";

//   timerId = setInterval(() => {
//     timerBox.innerText = `${++start} sec`;
//   }, 1000);
// }

// const createQuiz = async () => {
//   container.innerHTML = "";
//   const response = await fetch(`/quiz`);

//   // console.log(response);
//   // countQuizTimeSpend();
//   // удалить:
//   let data = await response.json();
//   console.log("data", data);
//   if (response.ok === true) {
//     // data.map(item => renderQuestion(item));
//     renderQuestion(data.question);
//     renderAnswersResult(data.currentQuestionNumber, data.correctAnswerCount);
//   }
// }

let userAnswer;
let questionid;
let gameUUID;

const checkAnswer = async () => {
  // console.log("_id: ", _id);
  // console.log("answerValue: ", userAnswer);
  // console.log("UCA", userAnswer);
 
  // socket.emit('user answer', "5716a678-e1fa-455b-bc2b-ba0502c89e9b","63b5aa46badaa6eeb8d24897", "100500");

  const answerResult = await fetch(`/quiz/${gameUUID}/${questionid}`, {
    method: "POST",
    body: JSON.stringify({
      userAnswer
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
 
  console.log("ANSWER_RESULT: ", answerResult);

  const correctAnswer = await answerResult.json();
  // console.log("_C_A_", correctAnswer);
  // console.log("data_next", correctAnswer);

  console.log("ANSWER_REVIEW: ", correctAnswer);

  let userID = localStorage.getItem("userID");

  if (correctAnswer) {
    socket.emit('user answer', gameUUID, userID);
  }

  // renderOneQuestion();

}


const renderOneQuestion = async (gameuuid) => {
  const container = document.querySelector("#container");
  container.innerHTML = "";

  const response = await fetch(`/quiz/${gameuuid}`);
  
  let data = await response.json();

  console.log("renderOneQuestion: ",data);

  if (response.ok === true && data.question && data.question._id) {
    renderQuestion(data.question);
    renderAnswersResult(data.currentQuestionNumber, data.correctAnswerCount);
    console.log("data_next", data);

  } else {
    container.innerHTML = `<h3 class="card-title" style="text-align:center;">FINISH</h3>`
    // clearInterval(timerId);
    renderAnswersResult(data.totalQuestions-1, data.correctAnswerCount);
    console.log("data_next", data);

    console.log("END");
  }
  
}
 
// renderOneQuestion();

const renderAnswersResult = (currentQuestionNumber, correctAnswerCount ) => {
  const answersResBox = document.querySelector(".answers-result-box");
  answersResBox.innerText = `${+correctAnswerCount}/ ${+currentQuestionNumber + 1}`;
  console.log(currentQuestionNumber);
  console.log(correctAnswerCount);
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

let questionNumber = 0;
const renderQuestion = ({ _id, title, answers } ) => {
  const divContainerText = document.createElement("div");
  const divContainerEdit = document.createElement("div");
  divContainerEdit.className = "d-none ";
  questionid = _id;
  // divContainerText.innerHTML = `
  // <div class="card-body d-flex">
  // <h5 class="card-title">${questionNumber ? `${++questionNumber})` : ""} ${title}</h5>
  // `
  divContainerText.innerHTML = `
  <div class="card-body d-flex">
  <h5 class="card-title">${title}</h5>
  `
  

  const ul = document.createElement("div");
  ul.className = "card-text d-flex flex-column quest-container";
  divContainerText.append(ul);

  

  ul.addEventListener("click", (event) => {
    if (!event.target.classList.contains('btn-answer')) return;
    userAnswer = event.target.innerText;
    console.log("userAnswer", userAnswer);
     
  }); // КЛИК
  

  const createAnswersList = (answer) => {
    const list = document.querySelector(".card-text");
    return `<button class="list__item item btn btn-outline-primary m-1 btn-sm btn-answer">
      ${typeof(answer)==="string"? answer : JSON.stringify(answer)}
      </button>`
  };

  const content = Object.values(answers).reduce((acc, item) => {
    acc += createAnswersList(item);
    return acc;
  }, "");
  ul.innerHTML = content;

  const div = document.createElement("div");
  const cardHeader = document.createElement("div");
  cardHeader.className = "card-header";
  cardHeader.innerHTML = `<p>${_id}</p>`;
  const btnDel = document.createElement("button");
  const btnShow = document.createElement("button");
  btnShow.innerText = "Edit";
  btnShow.className = "btn btn-outline-primary m-1 btn-sm";
  btnDel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>`;
  btnDel.className = "btn btn-outline-danger btn-sm";
  const questionTitle = document.createElement("input");
  questionTitle.className = "card-title";
  const questionAnswers = document.createElement("textarea");
  questionAnswers.className = "card-text";
  div.className = "col-md-6 card card-body";
  questionTitle.value = title;
  questionAnswers.value = JSON.stringify(answers);

  btnShow.addEventListener("click", () => {
    const isEdit = divContainerEdit.classList.toggle("d-none");
    divContainerText.classList.toggle("d-none");

    if (isEdit) {
      btnShow.innerText = "Edit";
    }
    else {
      btnShow.innerText = "Save";
    }

    divContainerText.innerHTML = `
      <div class="card-body">
      <h5 class="card-title">${questionTitle.value}</h5>
      <p class="card-text">${questionAnswers.value}</p>
      `
  });

  divContainerEdit.append(questionTitle);
  divContainerEdit.append(questionAnswers);
  cardHeader.append(btnShow);
  cardHeader.append(btnDel);
  div.append(cardHeader, divContainerEdit, divContainerText);

  document.getElementById("container").append(div);

  div.addEventListener("change", (e) => {
    fetch(`/question/${_id}`, {
      method: "PUT",
      body: JSON.stringify({
        _id: _id,
        title: questionTitle.value,
        answers: JSON.parse(questionAnswers.value),
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((json) => console.log(json));
  });

  btnDel.addEventListener("click", (e) => {
    fetch(`/question/${_id}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((json) => console.log(json));

    div.remove();
  })
};







///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

const loginForm = document.createElement("form");
loginForm.classList = 'm-auto px-2 w-100 h-100 text-center bg-light';

const loginDiv = document.createElement("div");
loginDiv.className = "m-1";
const loginLabel = document.createElement("label");
loginLabel.classList = "form-label";
loginLabel.innerText = "Login:";
const loginInput = document.createElement("input");
// loginInput.setAttribute('required', 'required'); 
loginInput.classList = "form-control";
loginLabel.append(loginInput);
loginDiv.append(loginLabel);

const passwordDiv = document.createElement("div");
passwordDiv.className = "m-1";
const passwordLabel = document.createElement("label");
passwordLabel.classList = "form-label";
passwordLabel.innerText = "Password:";
const passwordInput = document.createElement("input");
passwordInput.type = "password";
passwordInput.placeholder = "* 'a-zA-Z0-9_' 3-20 symbols";
// passwordInput.setAttribute('required', 'required'); 
passwordInput.classList = "form-control";

const passwordConfirmDiv = document.createElement("div");
passwordConfirmDiv.className = "m-1";
const passwordConfirmLabel = document.createElement("label");
passwordConfirmLabel.classList = "form-label";
passwordConfirmLabel.innerText = "Confirm password:";
const passwordConfirmInput = document.createElement("input");
passwordConfirmInput.type = "password";
passwordConfirmInput.placeholder = "* 'a-zA-Z0-9_' 3-20 symbols";
// passwordConfirmInput.setAttribute('required', 'required'); 
passwordConfirmInput.classList = "form-control";

passwordLabel.append(passwordInput);
passwordConfirmLabel.append(passwordConfirmInput);

passwordDiv.append(passwordLabel);
passwordConfirmDiv.append(passwordConfirmLabel);

const nickDiv = document.createElement("div");
nickDiv.className = "m-1";
const nickLabel = document.createElement("label");
nickLabel.classList = "form-label";
nickLabel.innerText = "Nick name:";
const nickInput = document.createElement("input");
nickInput.type = "text";
nickInput.placeholder = "not required";
nickInput.classList = "form-control";

nickLabel.append(nickInput);
nickDiv.append(nickLabel);

const btnDiv = document.createElement("div");

const loginBtn = document.createElement("button");
loginBtn.classList = "btn btn-outline-success m-2";
loginBtn.innerText = "LogIn";

const logoutBtn = document.createElement("button");
logoutBtn.classList = "btn btn-outline-dark m-2";
logoutBtn.innerText = "LogOut";

const signupBtn = document.createElement("button");
signupBtn.classList = "btn btn-outline-primary m-2";
signupBtn.innerText = "SignUp";

const deleteUserBtn = document.createElement("button");
deleteUserBtn.classList = "btn btn-outline-danger m-2";
deleteUserBtn.innerText = "Delete";

btnDiv.append(loginBtn, logoutBtn, signupBtn, deleteUserBtn);

loginForm.append(loginDiv, passwordDiv, passwordConfirmDiv, nickDiv, btnDiv);

document.querySelector(".login-form").append(loginForm);

loginBtn.addEventListener("click", function (e) {
  e.preventDefault();
  loginUser();
});

logoutBtn.addEventListener("click", function (e) {
  logoutUser();
});

signupBtn.addEventListener("click", function (e) {
  e.preventDefault();
  registerNewUser();
});

deleteUserBtn.addEventListener("click", function (e) {
  e.preventDefault();
  deleteUser(loginInput.value);
});

const btnAdd = document.createElement("button");
btnAdd.innerText = "Create Question";
btnAdd.className = "btn btn-outline-success m-2 align-self-center";

const btnShowQuestions = document.createElement("button");
btnShowQuestions.innerText = "Show Questions";
btnShowQuestions.className = "btn btn-outline-success m-2 align-self-center";

// const btnCreateQuiz = document.createElement("button");
// btnCreateQuiz.innerText = "Create Quiz";
// btnCreateQuiz.className = "btn btn-outline-primary m-2 align-self-center";

const btnNextQuestion = document.createElement("button");
btnNextQuestion.innerText = "Next";
btnNextQuestion.className = "btn btn-outline-primary m-2 align-self-center";

const answersResultBox = document.createElement("p");
answersResultBox.innerText = "Result: ";
answersResultBox.className = "m-2 align-self-center answers-result-box";

// document.getElementById("create_el").append(btnShowQuestions, btnAdd, btnCreateQuiz, btnNextQuestion, answersResultBox);
document.getElementById("create_el").append(btnShowQuestions, btnAdd, btnNextQuestion, answersResultBox);

//signup
const registerNewUser = async () => {
  fetch("/user/signup", {
    method: "POST",
    body: JSON.stringify({
      login: loginInput.value,
      password: passwordInput.value,
      nick: nickInput.value,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => { console.log(json) });
};

//login
const loginUser = async () => {
  fetch("/user/login", {
    method: "POST",
    body: JSON.stringify({
      login: loginInput.value,
      password: passwordInput.value,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => { 
      console.log(json) 
      localStorage.setItem("userID", json._id)
    });
};
 
//logout
const logoutUser = async () => {
  fetch(`/user/logout`)
    .then((response) => response.json())
    .then((json) => { console.log(json) });
};

//delete user
const deleteUser = async (_id) => {
  fetch(`/user/delete/${_id}`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
}



const openNewQuestionField = () => {
  const div = document.createElement("div");
  div.className = "d-flex flex-column";
  const questionTitle = document.createElement("input");
  questionTitle.placeholder = "add question";
  const questionAnswers = document.createElement("textarea");
  questionAnswers.placeholder = "add answers [{}]";
  questionAnswers.classList = "my-2"
  const btnSave = document.createElement("button");
  btnSave.innerText = "Save";
  btnSave.className = "btn btn-outline-success btn-sm mb-2";
  div.append(questionTitle, questionAnswers, btnSave);
  document.getElementById("create_el").append(div);
  btnAdd.removeEventListener("click", openNewQuestionField);

  const addNewQuestion = async () => {
    fetch("/question", {
      method: "POST",
      body: JSON.stringify({
        title: questionTitle.value,
        answers: JSON.parse(questionAnswers.value),
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        btnAdd.addEventListener("click", openNewQuestionField);
        div.remove();
        renderQuestions();
      });
  };
  btnSave.addEventListener("click", addNewQuestion);
}

btnAdd.addEventListener("click", openNewQuestionField);
btnShowQuestions.addEventListener("click", renderQuestions);
// btnCreateQuiz.addEventListener("click", createQuiz);
btnNextQuestion.addEventListener("click", checkAnswer);
















////////////////////////////////////////////////////////////////////////////////////////////
const gameName = "quiz";

const $usersBox = document.querySelector(".users-box");
const $events = document.getElementById('events');



const newItem = (content) => {
  const item = document.createElement('li');
  item.innerText = content;
  return item;
}

const renderUsers = (users) => {
  $usersBox.innerText = "";
  users.map(user => renderUser(user));
}

const renderUser = (user) => {
  const userBtn = document.createElement("button");
  userBtn.classList = "btn btn-outline-secondary m-1";
  userBtn.innerText = `${user._id} - ${user.login}`;
  $usersBox.append(userBtn);

  userBtn.addEventListener("click", async (e) => {
    const data = await fetch(`/game/new/${gameName}/${user._id}`);
    const gameLink = await data.text();
    //// http://localhost:8000/?gameuuid=3e59eb86-a153-43bf-8095-d10427caf14f
    // http://localhost:8000/?gameuuid=2c160999-0a08-4d45-bf7b-033e2de49957&invited-user-id=63b5aa3fbadaa6eeb8d24893
    if (gameLink) {
      const gameUUID = gameLink.slice(gameLink.lastIndexOf('=') + 1);
      console.log("GAME__UUID: ", gameUUID);

      socket.emit('create game', gameUUID);

      $events.append(newItem(`${gameLink}`));
      console.log("GAME__LINK: ", gameLink);
    }
  });
}

const getAllUsers = async () => {
  const response = await fetch(`/users`);
  let users = await response.json();
  // console.log("USERS", users);
  if (response.ok === true) {
    renderUsers(users);
  }
}


const btnShowUsers = document.createElement("button");
btnShowUsers.innerText = "Show Users";
btnShowUsers.classList = "btn btn-outline-success my-2";
btnShowUsers.addEventListener("click", getAllUsers);

document.getElementById("create_el").append(btnShowUsers);

getAllUsers();



//// Socket connection:
socket.on('connect', () => {
  $events.append(newItem(`Connected to socket: ${socket.id}`));
});


socket.on('game created', (gameUUID) => {
  $events.append(newItem(`Game created: ${gameUUID}`));
});


socket.on('game start', (gameUUID) => {
  console.log("gameRoomClients: ", gameUUID);
  $events.append(newItem(`Game started: ${gameUUID}`));

  // window.location.href = `http://localhost:8000/?quiz/${gameUUID}`;
  // history.pushState(null, 'Quiz', `http://localhost:8000/quiz/${gameUUID}`)

  renderOneQuestion(gameUUID);


});


//////////////////
window.onload = () => {
  const urlString = window.location.href;
  const url = new URL(urlString);
  const gameUUID = url.searchParams.get("gameuuid");
  // const invitedUserID = url.searchParams.get("invited-user-id");
  // console.log("PARAMS_gameUUID: ", gameUUID, invitedUserID);
  const userID = localStorage.getItem("userID");
  if(gameUUID) {
    socket.emit('invitation accepted', gameUUID, userID);
  };
};

socket.on('user answer accepted', (userID) => {
  console.log(`Cli: USER ID: ${userID} answered`);
  $events.append(newItem(`USER ID: ${userID} answered`));
});



// socket.on('user connected', (opponentUserLogin, gameName, gameUUID) => {
//   // console.log("UUUUU", userName, gameName, gameUUID);
//   $events.append(newItem(`${opponentUserLogin} connected to ${gameName} : ${gameUUID}`));
//   if (window.location.href !== `http://localhost:8000/${gameName}/${gameUUID}`) {
//     // window.location.href = `http://localhost:8000/${gameName}/${gameUUID}`;
//   }
// });