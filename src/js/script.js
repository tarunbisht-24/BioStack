
(function ($) {
  'use strict';

  // PRELOADER
  $(window).on('load', function () {
    $('#page-loader').fadeOut('slow', function () {
      $(this).remove();
    });
  });

	// navbarDropdown
	if ($(window).width() < 992) {
		$('.has-dropdown .dropdown-toggle').on('click', function () {
			$(this).siblings('.dropdown-menu').animate({
				height: 'toggle'
			}, 300);
		});
	}


  // SCROLL TO TOP
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 70) {
      $('.scroll-to-top').addClass('reveal');
    } else {
      $('.scroll-to-top').removeClass('reveal');
    }
  });


  // Fixed header
  $(window).on('scroll', function () {
    $('.site-navigation,.trans-navigation').addClass('header-white');
    // if ($(window).scrollTop() > 70) {
    //   $('.site-navigation,.trans-navigation').addClass('header-white');
    // } else {
    //   $('.site-navigation,.trans-navigation').removeClass('header-white');
    // }
  });
  

	// scroll-to-top
	if ($('#scroll-to-top').length) {
		$('#scroll-to-top').on('click', function () {
			$('body,html').animate({
				scrollTop: 0
			}, 600);
			return false;
		});
	}


  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').on('click', function (event) {
    $('.navbar-collapse').collapse('hide');
  });
})(jQuery);


const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const API_KEY = "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"; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

let dataset = []; // Initialize an empty array to store the CSV data

// Replace 'your_dataset.csv' with the actual path to your CSV file
fetch('sample_data.csv')
  .then(response => response.text()) // Get the raw text content of the CSV file
  .then(data => {
    // Split the CSV data into rows (assuming it's comma-separated)
    const rows = data.trim().split('\n');
    
    // Extract the header row to get column names
    const headers = rows[0].split(',');

    // Loop through the rows and convert them into objects
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      let item = {};

      for (let j = 0; j < headers.length; j++) {
        // Use the header as the object property and the value from the row
        item[headers[j]] = values[j];
      }

      dataset.push(item);
    }

    // Now, the 'dataset' array contains your CSV data as an array of objects
    console.log(dataset);
  })
  .catch(error => {
    console.error('Error loading dataset:', error);
  });


const generateResponse = (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    // Check if user's message matches any item in the dataset
    const matchingItem = dataset.find(item => item.Material.toLowerCase() === userMessage.toLowerCase());

    if (matchingItem) {
        // Create a response based on the dataset
        const response = `Material: ${matchingItem.Material}, Quantity: ${matchingItem.Quantity}, Weight: ${matchingItem.Weight}, Type: ${matchingItem.Type}, Size Range: ${matchingItem['Size Range']}, Price: ${matchingItem.Price}`;
        messageElement.textContent = response;
    } else {
        // If no match is found in the dataset, use the OpenAI API
        const API_URL = "https://api.openai.com/v1/chat/completions";
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
            })
        };

        // Send POST request to OpenAI API and set the response as paragraph text
        fetch(API_URL, requestOptions)
            .then(res => res.json())
            .then(data => {
                messageElement.textContent = data.choices[0].message.content.trim();
            })
            .catch(() => {
                messageElement.classList.add("error");
                messageElement.textContent = "Oops! Something went wrong. Please try again.";
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }
}


// const generateResponse = (chatElement) => {
//     const API_URL = "https://api.openai.com/v1/chat/completions";
//     const messageElement = chatElement.querySelector("p");

//     // Define the properties and message for the API request
//     const requestOptions = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${API_KEY}`
//         },
//         body: JSON.stringify({
//             model: "gpt-3.5-turbo",
//             messages: [{role: "user", content: userMessage}],
//         })
//     }

//     // Send POST request to API, get response and set the reponse as paragraph text
//     fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
//         messageElement.textContent = data.choices[0].message.content.trim();
//     }).catch(() => {
//         messageElement.classList.add("error");
//         messageElement.textContent = "Oops! Something went wrong. Please try again.";
//     }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
// }

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 100);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));








/* JavaScript */
window.addEventListener('load', function () {
  setTimeout(function(){
      document.getElementById('preloader').style.display = 'none';
  }, 500); // The preloader will hide after 3 seconds
});


"use strict";
const parentMarquee = document.querySelector(".marquee-wrapper");
const childMarquee = document.querySelector(".marquee-content");
// will clone the child node of Parent Marquee or copy the sibling 
const adChildMarquee = document.querySelector(".marquee-content").cloneNode(true);
parentMarquee.appendChild(adChildMarquee);
// code below will allow a draggable feature for the marquee carousel 
const ulParentListContainer = document.querySelector('.marquee-wrapper');
let isDragging = false;
const dragStart = (e) => {
    if (!isDragging)
        return;
    ulParentListContainer.scrollLeft -= e.movementX;
};
const stopDragging = () => {
    isDragging = false;
};
// when mouse is pressed 
ulParentListContainer.addEventListener('mousedown', () => isDragging = true);
// when mouse is move to left
ulParentListContainer.addEventListener('mousemove', dragStart);
// when mouse pressed is released
window.addEventListener('mouseup', stopDragging);


const menuBtn = document.querySelector(".menu-btn");
const navigation = document.querySelector(".navigation");

menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    navigation.classList.toggle("active");
});

const btns = document.querySelectorAll(".nav-btn");
const slides = document.querySelectorAll(".img-slide");
const contents = document.querySelectorAll(".content");

var sliderNav = function(manual){
    btns.forEach((btn) => {
        btn.classList.remove("active");
    });

    slides.forEach((slide) => {
        slide.classList.remove("active");
    });

    contents.forEach((content) => {
        content.classList.remove("active");
    });

    btns[manual].classList.add("active");
    slides[manual].classList.add("active");
    contents[manual].classList.add("active");
}

    btns.forEach((btn, i) => {
        btn.addEventListener("click", () => {
            sliderNav(i)
        });
    });
