const GRID_SIZE = 1000;
const CELL_SIZE = 150;

let grid_offset = { x: 0, y: 0 };
let is_dragging = false;
let start_pos = { x: 0, y: 0 };
let scrolls = new Map();
let current_scroll = null;

const grid = document.getElementById('grid');
const container = document.getElementById('grid-container');
const modal = document.getElementById('scroll-modal');
const modal_overlay = document.getElementById('modal-overlay');
const coordinates_display = document.getElementById('coordinates-display');
const scroll_content = document.getElementById('scroll-content');

function initialize_grid() {
	grid_offset.x = 0;
	grid_offset.y = 0;
	grid.style.transform = `translate(${grid_offset.x}px, ${grid_offset.y}px)`;
	render_visible_cells();
}

function update_grid_position() {
	grid.style.transform = `translate(${grid_offset.x}px, ${grid_offset.y}px)`;
}

function render_visible_cells() {
	grid.innerHTML = '';

	const start_x = Math.floor(-grid_offset.x / CELL_SIZE);
	const start_y = Math.floor(-grid_offset.y / CELL_SIZE);
	const end_x = start_x + Math.ceil(window.innerWidth / CELL_SIZE) + 1;
	const end_y = start_y + Math.ceil(window.innerHeight / CELL_SIZE) + 1;

	for (let x = Math.max(start_x, 0); x < Math.min(end_x, GRID_SIZE); x++) {
		for (let y = Math.max(start_y, 0); y < Math.min(end_y, GRID_SIZE); y++) {
			const scroll_content = scrolls.get(`${x + 1},${y + 1}`);
			if (scroll_content) {
				render_scroll(x, y, scroll_content);
			}
		}
	}
}

function render_scroll(x, y, content) {
	const scroll = document.createElement('div');
	scroll.className = 'scroll';
	scroll.style.left = `${x * CELL_SIZE}px`;
	scroll.style.top = `${y * CELL_SIZE}px`;
	scroll.textContent = content;
	scroll.onclick = (e) => {
		e.stopPropagation();
		open_modal(x + 1, y + 1, content);
	};
	grid.appendChild(scroll);
}

function open_modal(x, y, content = '') {
	current_scroll = { x, y };
document.getElementById('scroll-coordinates').innerHTML = `<span style="color: #888">1.1.1/1.1.1/1.</span>${x}.${y}`;
scroll_content.value = content;
modal.style.display = 'block';
modal_overlay.style.display = 'block';
scroll_content.focus();
}

function close_modal() {
modal.style.display = 'none';
modal_overlay.style.display = 'none';
current_scroll = null;
}

function save_scroll() {
const content = document.getElementById('scroll-content').value.trim();
if (content && current_scroll) {
	scrolls.set(`${current_scroll.x},${current_scroll.y}`, content);
	render_visible_cells();
}
close_modal();
}

function delete_scroll() {
if (current_scroll) {
	scrolls.delete(`${current_scroll.x},${current_scroll.y}`);
	render_visible_cells();
}
close_modal();
}

container.addEventListener('mousedown', (e) => {
if (e.target === container || e.target === grid) {
	is_dragging = true;
	container.classList.add('grabbing');
	start_pos = {
		x: e.clientX - grid_offset.x,
		y: e.clientY - grid_offset.y
	};
}
});

container.addEventListener('dblclick', (e) => {
if (e.target === container || e.target === grid) {
	const rect = container.getBoundingClientRect();
	const x = Math.floor((e.clientX - rect.left - grid_offset.x) / CELL_SIZE);
	const y = Math.floor((e.clientY - rect.top - grid_offset.y) / CELL_SIZE);

	if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
		open_modal(x + 1, y + 1);
	}
}
});

window.addEventListener('mousemove', (e) => {
if (is_dragging) {
	grid_offset.x = e.clientX - start_pos.x;
	grid_offset.y = e.clientY - start_pos.y;

	const min_x = -GRID_SIZE * CELL_SIZE + window.innerWidth;
	const min_y = -GRID_SIZE * CELL_SIZE + window.innerHeight;

	grid_offset.x = Math.min(0, Math.max(min_x, grid_offset.x));
	grid_offset.y = Math.min(0, Math.max(min_y, grid_offset.y));

	update_grid_position();
	render_visible_cells();
}
});

window.addEventListener('mouseup', () => {
is_dragging = false;
container.classList.remove('grabbing');
});

window.addEventListener('resize', () => {
render_visible_cells();
});

container.addEventListener('mousemove', (e) => {
const rect = container.getBoundingClientRect();
const x = Math.floor((e.clientX - rect.left - grid_offset.x) / CELL_SIZE);
const y = Math.floor((e.clientY - rect.top - grid_offset.y) / CELL_SIZE);

if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
	coordinates_display.innerHTML = `<span style="color: #888">1.1.1/1.1.1/1.</span>${x + 1}.${y + 1}`;
	} else {
		coordinates_display.textContent = 'Out of bounds';
	}
});

container.addEventListener('touchstart', (e) => {
	if (e.target === container || e.target === grid) {
		is_dragging = true;
		container.classList.add('grabbing');
		const touch = e.touches[0];
		start_pos = {
			x: touch.clientX - grid_offset.x,
			y: touch.clientY - grid_offset.y
		};
	}
});

container.addEventListener('touchmove', (e) => {
	e.preventDefault();
	const touch = e.touches[0];
	if (is_dragging) {
		grid_offset.x = touch.clientX - start_pos.x;
		grid_offset.y = touch.clientY - start_pos.y;

		const min_x = -GRID_SIZE * CELL_SIZE + window.innerWidth;
		const min_y = -GRID_SIZE * CELL_SIZE + window.innerHeight;

		grid_offset.x = Math.min(0, Math.max(min_x, grid_offset.x));
		grid_offset.y = Math.min(0, Math.max(min_y, grid_offset.y));
	
		update_grid_position();
		render_visible_cells();
	}
});

let last_tap = 0;
container.addEventListener('touchend', (e) => {
	const current_time = new Date().getTime();
	const tap_length = current_time - last_tap;
	if (tap_length < 500 && tap_length > 0) {
		if (e.target === container || e.target === grid) {
			const touch = e.changedTouches[0];
			const rect = container.getBoundingClientRect();
			const x = Math.floor((touch.clientX - rect.left - grid_offset.x) / CELL_SIZE);
			const y = Math.floor((touch.clientY - rect.top - grid_offset.y) / CELL_SIZE);

			if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
				open_modal(x + 1, y + 1);
			}
		}
	}
	last_tap = current_time;
	is_dragging = false;
	container.classList.remove('grabbing');
});

container.addEventListener('touchcancel', () => {
	is_dragging = false;
	container.classList.remove('grabbing');
});

initialize_grid();
