const renderQuestions = async () => {
  const container = document.querySelector("#container");
  container.innerHTML = "";
  const response = await fetch(`/question`);
  // console.log(response);

  let data = await response.json();
  console.log(data);

  if (response.ok === true) {
    data.map(item => renderQuestion(item));
  }
}

const renderQuestion = ({ _id, title, answers }) => {
  const divContainerText = document.createElement("div");
  const divContainerEdit = document.createElement("div");
  divContainerEdit.className = "d-none";

  divContainerText.innerHTML = `
  <div class="card-body">
  <h5 class="card-title">${title}</h5>
  `

  const ul = document.createElement("ul");
  ul.className = "card-text";
  divContainerText.append(ul);

  const createAnswersList = (answer) => {
    const list = document.querySelector(".card-text");
    return `<li class="list__item item">
        ${JSON.stringify(answer)}
      </li>`
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
  div.append(cardHeader);
  div.append(divContainerEdit);
  div.append(divContainerText);

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

////////////// loginForm
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
    .then((json) => {console.log(json)});
};

const loginUser = async () => {
  fetch("/user/login", {
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
    .then((json) => {console.log(json)});
};

const logoutUser = async () => {
  fetch(`/user/logout`)
    .then((response) => response.json())
    .then((json) => {console.log(json)});
};



const loginForm = document.createElement("form");
loginForm.classList = 'm-auto px-2 w-100 h-100 text-center bg-light';

const loginDiv = document.createElement("div");
loginDiv.className="m-1";
const loginLabel = document.createElement("label");
loginLabel.classList = "form-label";
loginLabel.innerText = "Email:";
const loginInput = document.createElement("input");
// loginInput.type = "email";
loginInput.setAttribute('required', 'required'); 
loginInput.classList = "form-control";

loginLabel.append(loginInput);
loginDiv.append(loginLabel);

const passwordDiv = document.createElement("div");
passwordDiv.className="m-1";
const passwordLabel = document.createElement("label");
passwordLabel.classList = "form-label";
passwordLabel.innerText = "Password:";
const passwordInput = document.createElement("input");
passwordInput.type = "password";
passwordInput.setAttribute('required', 'required'); 
passwordInput.classList = "form-control";

passwordLabel.append(passwordInput);
passwordDiv.append(passwordLabel);

const nickDiv = document.createElement("div");
nickDiv.className="m-1";
const nickLabel = document.createElement("label");
nickLabel.classList = "form-label";
nickLabel.innerText = "Nick name:";
const nickInput = document.createElement("input");
nickInput.type = "text";
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

btnDiv.append(loginBtn, logoutBtn, signupBtn);

loginForm.append(loginDiv, passwordDiv, nickDiv, btnDiv);

document.querySelector(".login-form").append(loginForm);

loginBtn.addEventListener("click", function (e){
  e.preventDefault();
  loginUser();
});

logoutBtn.addEventListener("click", function (e){
  // e.preventDefault(); //// удалить
  logoutUser();
});

signupBtn.addEventListener("click", function (e){
  e.preventDefault();
  registerNewUser();
});


/////////////

const btnAdd = document.createElement("button");
btnAdd.innerText = "Create Question";
btnAdd.className = "btn btn-outline-success m-2 w-25 align-self-center";
const btnShowQuestions = document.createElement("button");
btnShowQuestions.innerText = "Show Question";
btnShowQuestions.className = "btn btn-outline-success m-2 w-25 align-self-center";
document.getElementById("create_el").append(btnShowQuestions, btnAdd);

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
  div.append(questionTitle);
  div.append(questionAnswers);
  div.append(btnSave);
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

// renderQuestions();
