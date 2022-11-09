const renderQuestions = async () => {
  const container = document.querySelector("#container");
  container.innerHTML = "";
  fetch(`/questions`)
    .then(response => response.json())
    .then(data => data.map(item => renderQuestion(item)));
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
  btnShow.className = "btn btn-primary m-1";
  btnDel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>`;
  btnDel.className = "btn btn-danger";
  const postTitle = document.createElement("input");
  postTitle.className = "card-title";
  const postBody = document.createElement("textarea");
  postBody.className = "card-text";
  div.className = "col-md-6 card card-body";
  postTitle.value = title;
  postBody.value = JSON.stringify(answers);

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
      <h5 class="card-title">${postTitle.value}</h5>
      <p class="card-text">${postBody.value}</p>
      `
  });

  divContainerEdit.append(postTitle);
  divContainerEdit.append(postBody);
  cardHeader.append(btnShow);
  cardHeader.append(btnDel);
  div.append(cardHeader);
  div.append(divContainerEdit);
  div.append(divContainerText);

  document.getElementById("container").append(div);

  div.addEventListener("change", (e) => {
    fetch(`/questions/${_id}`, {
      method: "PUT",
      body: JSON.stringify({
        _id: _id,
        title: postTitle.value,
        answers: JSON.parse(postBody.value),
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((json) => console.log(json));
  });

  btnDel.addEventListener("click", (e) => {
    fetch(`/questions/${_id}`, {
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

const btnAdd = document.createElement("button");
btnAdd.innerText = "Create Question";
btnAdd.className = "btn btn-success m-2";
document.getElementById("create_el").append(btnAdd);

const openNewQuestionField = () => {
  const div = document.createElement("div");
  div.className = "d-flex flex-column";
  const postTitle = document.createElement("input");
  const postBody = document.createElement("textarea");
  const btnSave = document.createElement("button");
  btnSave.innerText = "Save";
  btnSave.className = "btn btn-success";
  div.append(postTitle);
  div.append(postBody);
  div.append(btnSave);
  document.getElementById("create_el").append(div);
  btnAdd.removeEventListener("click", openNewQuestionField);

  const addNewQuestion = async () => {
    fetch("/questions", {
      method: "POST",
      body: JSON.stringify({
        title: postTitle.value,
        answers: JSON.parse(postBody.value),
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

renderQuestions();
