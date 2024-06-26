//   console.log(JSON.parse(storage.paul).text); -> parse 후 사용 가능
const storage = { ...localStorage };
const movieId = sessionStorage.getItem("MOVIE_ID");

// 리뷰 작성
function postComment() {
  const text = document.getElementById("input-review").value;
  const writer = document.getElementById("input-writer").value;
  const password = document.getElementById("input-password").value;
  const personId = crypto.randomUUID(); // 고유 ID
  const timestamp = Date.now();
  // 로컬 스토리지 - { 영화 ID : { 고유ID(유저) : {name: 유저이름 text: 리뷰내용, password: 비번, star: 별점 } } } 형식으로 저장
  // 로컬 스토리지에 저장된 유저 id 값 없으면 생성과 동시에 데이터 삽입 - json parse 한 스토리지는 undefiend에 접근불가. 접근하고 난뒤 parse해서 이용
  // 영문 숫자 조합 8자리 이상
  const reg = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,25}$/;
  const star = document.getElementById("select-stars").value;
  if (text === "" || writer === "" || password === "" || star === "별점선택") {
    alert("입력되지 않은 정보가 있습니다.");
  } else {
    if (reg.test(password)) {
      if (!storage[movieId]) {
        let inputData = {
          [personId]: {
            name: writer,
            text: text,
            star: star,
            password: password,
            time: timestamp
          }
        };
        localStorage.setItem(movieId, JSON.stringify(inputData));
        // 저장된 유저 id가 있으면 있으면 데이터를 불러와서, 새로운 입력값(새로운 유저의 이름(key) - 내용,비번(value)값)을 추가 한뒤 localStorage.setItem로 재설정
      } else {
        // 해당 페이지의 데이터를 불러옴
        let currentData = JSON.parse(localStorage.getItem(movieId));
        // 불러온 데이터에 새로운 입력값 추가
        currentData[personId] = {
          name: writer,
          text: text,
          password: password,
          star: star
        };
        // // json 문자열로 변환해서 로컬 스토리지에 넣기(재설정)
        localStorage.setItem(movieId, JSON.stringify(currentData));
      }
      window.location.reload();
    } else {
      alert("패스워드는 영문 숫자 조합 8자리 이상으로 입력해 주세요");
    }
  }
}

// 리뷰 불러오기
function getComment() {
  const list = document.getElementById("review-list");
  let dom = "";
  if (storage[movieId]) {
    let parsedData = JSON.parse(storage[movieId]);
    for (const prob in parsedData) {
      // li 태그에 유저id 부여
      dom =
        dom +
        `
          <li class="review" id=${prob}> 
            <div class="text">${parsedData[prob].text}</div>
            <div class="writer">${parsedData[prob].name}</div>
            <div class="review-star">${parsedData[prob].star}</div>
            <button type="button" class="edit-btn btn btn-secondary update-modal" data-bs-toggle="modal" data-bs-target="#exampleModal" style="font-size: 1.8vh">수정</button>
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">리뷰 수정</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <textarea class="modal-body modal-text" placeholder="리뷰 내용" id="update-text"></textarea>
                  <select class="form-select" id="update-star">
                    <option selected>별점수정</option>
                    <option value="⭐">⭐</option>
                    <option value="⭐⭐">⭐⭐</option>
                    <option value="⭐⭐⭐">⭐⭐⭐</option>
                    <option value="⭐⭐⭐⭐">⭐⭐⭐⭐</option>
                    <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐</option>
                  </select>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    <button type="button" class="btn btn-primary update">저장</button>
                  </div>
                </div>
              </div>
            </div>
            <button type= "submit" class="del-btn btn btn-secondary delete" id="delete" style="font-size: 1.8vh">삭제</button>
          </li>
          `;
    }
    list.innerHTML = dom;
  } else {
    // json 오류 방지(undefined 값을 parse 하지 못해서 오류 발생)
    return;
  }
}

// 리뷰 수정
function updateComment() {
  const updateModal = document.getElementsByClassName("update-modal");
  const arrUpdateModal = Object.keys(updateModal).map((el) => updateModal[el]);
  arrUpdateModal.forEach((element) => {
    element.addEventListener("click", (e) => {
      const passPrompt = prompt("비밀번호를 입력해 주세요", "여기 써 주세요!");
      // id: <li> tag에 저장한 유저 id 값
      let id = e.target.parentNode.id;
      // let password = e.target.parentNode.parentNode.children[2].value;
      const savedPassword = JSON.parse(localStorage.getItem(movieId))[id].password;

      // const password = document.getElementByc("update-password").value;
      // 저장된 비밀번호와 입력한 비밀번호가 같으면 텍스트와 별점 수정
      if (savedPassword === passPrompt) {
        const editButtons = document.getElementsByClassName("update");
        const arrEdits = Object.keys(editButtons).map((el) => eidtButtons[el]);
        arrEdits.forEach((element) => {
          element.addEventListener("click", (e) => {
            let currentData = JSON.parse(localStorage.getItem(movieId));
            const text = document.getElementById("update-text").value;
            const star = document.getElementById("update-star").value;
            // 텍스트만 수정시 처리
            if (star !== "별점수정" && text) {
              // 로컬 스토리지에서 불러온 데이터에서 해당 유저의 text,별점 수정, setItem 메서드로 재생성
              currentData[id].text = text;
              currentData[id].star = star;
            } else if (star !== "별점수정" && !text) {
              currentData[id].star = star;
            } else if (star === "별점수정" && text) {
              currentData[id].text = text;
            } else if (star === "별점수정" && !text) {
              // do nothing
            }
            localStorage.setItem(movieId, JSON.stringify(currentData));
            window.location.reload();
          });
        });
      } else if (passPrompt === null) {
        let modalContent = document.querySelector(".modal-dialog");
        let modalBackdrop = document.querySelector(".modal-backdrop");
        modalContent.style.display = "none";
        modalBackdrop.remove();
        window.location.reload();
      } else {
        alert("비밀번호가 틀렸습니다.");
        let modalContent = document.querySelector(".modal-dialog");
        let modalBackdrop = document.querySelector(".modal-backdrop");
        modalContent.style.display = "none";
        modalBackdrop.remove();
        window.location.reload();
      }
    });
  });
}

// 리뷰 삭제
function deleteComment() {
  const deleteButtons = document.getElementsByClassName("delete");
  const arrDelete = Object.keys(deleteButtons).map((el) => deleteButtons[el]);
  let currentData = JSON.parse(localStorage.getItem(movieId));
  arrDelete.forEach((element) => {
    element.addEventListener("click", (e) => {
      // 불러온 로컬 스토리지 데이터에서 <li> 태그에 저장된 유저 id의 키값 삭제
      let id = e.target.parentNode.id;
      const savedPassword = JSON.parse(localStorage.getItem(movieId))[id].password;
      const passPrompt = prompt("비밀번호를 입력해 주세요", "여기 써 주세요!");
      if (savedPassword === passPrompt) {
        delete currentData[id];
        // // 키값 삭제된 로컬스토리지 setItem 메서드로 재생
        localStorage.setItem(movieId, JSON.stringify(currentData));
        window.location.reload();
      } else if (passPrompt === null) {
        // do nothing
      } else {
        alert("비밀번호가 틀렸습니다.");
      }
    });
  });
}

export { postComment, getComment, deleteComment, updateComment };
