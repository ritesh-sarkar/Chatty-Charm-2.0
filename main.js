window.onload = function() {
  main();
}

function main() {

  // Image update part.

  const imageUpdate = (nUrl) => {
    let userImageUrl = localStorage.getItem('user_image_source');

    if (userImageUrl) {
      nUrl.src = userImageUrl;
    };
  };


  // Main part

  // Variable part

  const chat_wrapper = document.querySelector('.chat_wrapper');

  const initial_part = document.querySelector('.initial_part');

  const suggestions = document.querySelectorAll(".chat_list .chat_opt");

  const input = document.querySelector('.input_text');

  const sendButton = document.querySelector('.send');

  const deleteButton = document.querySelector('.delete');

  const API_KEY = "AIzaSyDGD4ftYRzm-IrC_uu0ODRBkc5q665LAYQ"

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`

  let userInput = input.textContent.trim();

  let response_for_generation = false;

  let conversation_history = [];
  let max_int_history = 200
  let max_history = 500;

  // Function Area

  const scrollFunction = () => {
    setTimeout(() => {
      chat_wrapper.scrollTo(0, chat_wrapper.scrollHeight);
    }, 100);
  };

  const savedItem = () => {

    const saved_chat = localStorage.getItem('saved_chat');

    chat_wrapper.innerHTML = saved_chat || "";

    if (!localStorage.getItem('saved_chat')) {
      initial_part.style.display = 'block';
      chat_wrapper.style.display = 'none'
    } else {
      initial_part.style.display = 'none';
      chat_wrapper.style.display = 'flex';
    }

    scrollFunction();
  };


  const massage_module = (element, ...all_classes) => {
    const newDiv = document.createElement('div');
    newDiv.classList.add(all_classes);
    newDiv.innerHTML = element;
    return newDiv;
  };

  const get_incoming_massage = async (incomig_massage) => {
    try {
      conversation_history.push({ role: "user", content: userInput });

      if (conversation_history.length > max_history * 2) {
        conversation_history = conversation_history.slice(-max_history * 2); // Fixed variable
      };

      let conversation_context = conversation_history.map(massage => massage.content).join('\n'); // Removed 'User:' and 'Bot:' prefixes

      let response = await fetch(API_URL, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: conversation_context }],
                          }],
        }),
      });

      let data = await response.json();

      const respondedText = data.candidates[0].content.parts[0].text;

      conversation_history.push({ role: "bot", content: respondedText });

      const robot_chat = incomig_massage.querySelector('.robot_chat');

      typingAnimation(respondedText, robot_chat);

    } catch (e) {
      incomig_massage.querySelector('.robot_chat').textContent = "Ops! I'm dead...I'll be back!";
      incomig_massage.querySelector('.chat_incoming').classList.add('error');
      response_for_generation = false;
    } finally {
      incomig_massage.querySelector('.loader').remove();

    };
  };



  const typingAnimation = (letters, textElement) => {
    sendButton.disabled = true;
    textElement.innerHTML = "";

    const code_parts = letters.split(/(```[\s\S]*?```|\*\*[\s\S]*?\*\*)/);

    const processing_separate_parts = (parts, resolve) => {
      if (parts.startsWith("```") && parts.endsWith("```")) {

        const code_content = parts.slice(3, -3).trim();
        let codeBlock = document.createElement('pre');
        let code_container = document.createElement('code');
        let copyBtn_for_codes = document.createElement("button");
        copyBtn_for_codes.innerHTML = `<img src="copy-svgrepo-com.svg" class="copyImg">`
        copyBtn_for_codes.classList.add("copy");

        code_container.textContent = code_content;
        codeBlock.appendChild(code_container);
        codeBlock.appendChild(copyBtn_for_codes);
        textElement.appendChild(codeBlock);
        copyBtn_for_codes.addEventListener('click', () => {
          navigator.clipboard.writeText(code_content);
        });
        hljs.highlightElement(code_container);
        resolve();
      } else if (parts.startsWith("**") && parts.endsWith("**")) {
        const boldSpan = document.createElement('span');
        const boldContent = parts.slice(2, -2).trim();
        boldSpan.classList.add('bold_span');
        textElement.appendChild(boldSpan);

        // Typing animation for bold text
        let charIndex = 0;
        let animationInterval = setInterval(() => {
          boldSpan.textContent += boldContent[charIndex++];
          if (charIndex === boldContent.length) {
            clearInterval(animationInterval);
            resolve();
          }
        }, 1);
      } else {
        const textSpan = document.createElement("span");
        textElement.appendChild(textSpan);
        const words = parts.split(' ');

        let wordIndex = 0;
        let animationInterval = setInterval(() => {
          textSpan.textContent += (wordIndex === 0 ? '' : ' ') + words[wordIndex++];
          if (wordIndex === words.length) {
            clearInterval(animationInterval);
            localStorage.setItem('saved_chat', chat_wrapper.innerHTML);
            response_for_generation = false;
            resolve();
          }
          scrollFunction();
        }, 75);
      }
    };

    const processing_separate_parts_sequentially = async () => {
      for (const parts of code_parts) {
        await new Promise((resolve) => processing_separate_parts(parts, resolve));
      };
      sendButton.disabled = false;
      scrollFunction();
    };
    processing_separate_parts_sequentially();

  };

  const loading = () => {
    const newHtml = ` <div class="chat_incoming">
                      <div class="chat_incoming_details">
                        <img src="chat_robot.png" class="chatImg">
                        <p class="robot_chat"></p>
                        <div class="loader">
                          <div class="circle">
                            <div class="dot"></div>
                            <div class="outline"></div>
                          </div>
                          <div class="circle">
                            <div class="dot"></div>
                            <div class="outline"></div>
                          </div>
                          <div class="circle">
                            <div class="dot"></div>
                            <div class="outline"></div>
                          </div>
                          <div class="circle">
                            <div class="dot"></div>
                            <div class="outline"></div>
                          </div>
                        </div>
                        
                        
                        <button class="copy"><img src="copy-svgrepo-com.svg" class="copyImg"></button>
                      </div>
                    </div>`;

    const incomig_massage = massage_module(newHtml, 'chat_incoming', 'loader');

    chat_wrapper.appendChild(incomig_massage);

    get_incoming_massage(incomig_massage);

    incomig_massage.querySelector('.copy').addEventListener('click', () => {
      navigator.clipboard.writeText(incomig_massage.querySelector('.robot_chat').textContent);
    });
  };

  const handleMassageSend = () => {
    userInput = input.value.trim();

    let html_outgoing = `<div class="chat_outgoing_details">
          <img src="user.svg" class="userImg">
          <p class="user_chat">${userInput}</p>
        </div>`

    const new_outgoing_module = massage_module(html_outgoing, 'chat_outgoing');

    const newImage = new_outgoing_module.querySelector('.userImg');

    imageUpdate(newImage)

    chat_wrapper.appendChild(new_outgoing_module);

    setTimeout(loading, 200);

    input.value = "";

    scrollFunction();

    initial_part.style.display = 'none';
    chat_wrapper.style.display = 'flex';

  };

  sendButton.addEventListener('click', (e) => {
    e.preventDefault();
    handleMassageSend();
  });


  deleteButton.addEventListener('click', () => {
    if (confirm('Do you want to clear me permanently? 🥺')) {
      localStorage.removeItem('saved_chat');
      initial_part.style.display = 'block';
      chat_wrapper.style.display = 'none';
    }
    savedItem();
  });

  // Function Execution Area 

  savedItem();


  // Designing Part...


  //Scrolling in texarea

  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px'; // Set new height based on content

  });

};
