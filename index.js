import {fetchEvents,addEvents} from "./modules/EventModule.js"
import {addOrders, fetchOrders} from "./modules/OrdersModule.js";
//Navbar animations
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click',()=>{
        //Toggle Nav
        nav.classList.toggle('nav-active');
        //Animate Links
        navLinks.forEach((link,index)=>{
            if(link.style.animation){
                link.style.animation = '';
            }else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 5 + 0.5}s`;
            }
        });
        //Burger animation
        burger.classList.toggle('toggle');
    });
}
//Magic that I didn't write***************************************************************
async function renderHomePage() {
    const mainContentDiv = document.querySelector('.main-content');
    mainContentDiv.innerHTML = getHomePageTemplate();
    try {
        const eventData = await fetchEvents();
        addEvents(eventData);
    } catch (error) {
        console.error('Error fetching and rendering event data:', error);
    }
}
async function renderOrdersPage() {
    const mainContentDiv = document.querySelector('.main-content');
    mainContentDiv.innerHTML = getOrdersPageTemplate();
    try {
        const orderData = await fetchOrders();
        addOrders(orderData);
    } catch (error) {
        console.error('Error fetching and rendering event data:', error);
    }
}
function renderContent(url) {
    const mainContentDiv = document.querySelector('.main-content');
    mainContentDiv.innerHTML = '';
    if (url === '/') {
        renderHomePage();
    } else if (url === '/orders') {
        renderOrdersPage();
    }
}
function navigateTo(url) {
    history.pushState(null, null, url);
    renderContent(url);
}
function setupInitialPage() {
    const initialUrl = window.location.pathname;
    renderContent(initialUrl);
}
function getHomePageTemplate() {
    return `
        <div class="event-list"></div>
        <div class="popup"></div>
    `;
}
function getOrdersPageTemplate() {
    return `
        <div class="order-list"></div>
  `;
}
//Magic that I don't even understand and on top of that broke my css code,so I don't use 'em
function setupPopstateEvent() {
    window.addEventListener('popstate', () => {
        const currentUrl = window.location.pathname;
        renderContent(currentUrl);
    });
}
function setupNavigationEvents() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const href = link.getAttribute('href');
            navigateTo(href);
        });
    });
}
//Main function**************************************************************************
const app = ()=>{
    navSlide();
    // setupNavigationEvents();
    // setupPopstateEvent();
    setupInitialPage();
}
app();