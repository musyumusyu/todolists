const input = document.getElementById("todo-input");
const dateTimeInput = document.getElementById("due-datetime");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("todo-list");

const sortDoneBtn = document.getElementById("sort-done-btn");
const hideDoneBtn = document.getElementById("hide-done-btn");

// 保存データ読み込み
let todos = JSON.parse(localStorage.getItem("todos")) || [];

// UI状態
let sortDoneLast = false;
let hideDone = false;

// 🔽 締切の近い順に並べる
function sortTodos() {
  todos.sort((a, b) => {
    if (!a.due && !b.due) return 0;
    if (!a.due) return 1;
    if (!b.due) return -1;
    return new Date(a.due) - new Date(b.due);
  });

  // ✅ 完了済みを下にまとめる
  if (sortDoneLast) {
    todos.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
  }
}

// 🕒 残り時間を計算
function getTimeLeft(due) {
  const now = new Date();
  const target = new Date(due);
  const diff = target - now;

  if (diff <= 0) return "期限切れ";

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `あと${days}日${hours % 24}時間`;
  } else if (hours > 0) {
    return `あと${hours}時間${mins % 60}分`;
  } else {
    return `あと${mins}分`;
  }
}

// 🖼️ リストを描画
function render() {
  sortTodos();
  list.innerHTML = "";

  todos.forEach((todo, index) => {
    if (hideDone && todo.done) return; // 👈 完了非表示モードならスキップ

    const li = document.createElement("li");

    // ✅ チェックボックス
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleDone(index));

    // 📝 テキスト
    const textPart = document.createElement("span");
    textPart.textContent = todo.text;

    if (todo.done) {
      textPart.style.textDecoration = "line-through";
      textPart.style.opacity = "0.6";
    } else {
      textPart.style.textDecoration = "none";
      textPart.style.opacity = "1";
    }

    // 🗓️ 締切情報
    const infoPart = document.createElement("div");
    infoPart.style.fontSize = "0.9em";
    infoPart.style.marginTop = "4px";

    if (todo.due) {
      const dueDate = new Date(todo.due);
      const y = dueDate.getFullYear();
      const m = String(dueDate.getMonth() + 1).padStart(2, "0");
      const d = String(dueDate.getDate()).padStart(2, "0");
      const h = String(dueDate.getHours()).padStart(2, "0");
      const min = String(dueDate.getMinutes()).padStart(2, "0");

      const timeLeft = getTimeLeft(todo.due);
      infoPart.textContent = `締切: ${y}/${m}/${d} ${h}:${min}（${timeLeft}）`;

      if (timeLeft === "期限切れ" && !todo.done) {
        infoPart.style.color = "red";
      } else {
        infoPart.style.color = "#555";
      }
    }

    // 🧩 テキスト＋締切まとめ
    const textBlock = document.createElement("div");
    textBlock.appendChild(textPart);
    if (todo.due) textBlock.appendChild(infoPart);

    // ❌ 削除ボタン
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTodo(index);
    });

    li.appendChild(checkbox);
    li.appendChild(textBlock);
    li.appendChild(delBtn);
    list.appendChild(li);
  });

  // ボタン表示を更新
  sortDoneBtn.textContent = sortDoneLast ? "完了済みを上に戻す" : "完了済みを下に並べる";
  hideDoneBtn.textContent = hideDone ? "完了済みを表示する" : "完了済みを非表示にする";
}

// ➕ タスク追加
function addTodo() {
  const text = input.value.trim();
  const due = dateTimeInput.value;
  if (!text) return;
  todos.push({ text, done: false, due });
  input.value = "";
  dateTimeInput.value = "";
  save();
  render();
}

// ✅ 完了切り替え
function toggleDone(index) {
  todos[index].done = !todos[index].done;
  save();
  render();
}

// ❌ 削除
function deleteTodo(index) {
  todos.splice(index, 1);
  save();
  render();
}

// 💾 保存
function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// 🪄 ソート切り替え
sortDoneBtn.addEventListener("click", () => {
  sortDoneLast = !sortDoneLast;
  render();
});

// 👻 完了非表示切り替え
hideDoneBtn.addEventListener("click", () => {
  hideDone = !hideDone;
  render();
});

addBtn.addEventListener("click", addTodo);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTodo();
});

// 🕐 1分ごとに残り時間を更新
setInterval(render, 60000);

render();
