/* ***
Проект: Имя_проекта
Автор: Чернеев Иван Петрович
Версия: 1.0
Связаться по эл. почте: cherneev91@mail.ru
*** */

// модули для babel
import "core-js/stable";
import "regenerator-runtime/runtime";
// полифиллы

// модули проекта
import tab from "./modules/tab";
import modal from "./modules/modal";
import timer from "./modules/timer";
import card from "./modules/card";
import calc from "./modules/calc";
import form from "./modules/form";
import slider from "./modules/slider";

window.addEventListener("DOMContentLoaded", () => {

	tab();
	modal();
	timer();
	card();
	calc();
	form();
	slider();

});

