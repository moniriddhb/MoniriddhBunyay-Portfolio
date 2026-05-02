import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
const title = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedIndex = -1;

function renderChart(projectList) {
  d3.select('#projects-pie-plot').selectAll('*').remove();
  d3.select('.legend').selectAll('*').remove();

  let rolledData = d3.rollups(
    projectList,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  arcData.forEach((d, idx) => {
    d3.select('#projects-pie-plot')
      .append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(idx))
      .attr('class', selectedIndex === idx ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        renderChart(projectList);
      });
  });

  let legend = d3.select('.legend');

  data.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', selectedIndex === idx ? 'selected' : '')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        renderChart(projectList);
      });
  });
}

function updateProjects() {
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join(' ').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  title.textContent = `${filteredProjects.length} Projects`;
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderChart(filteredProjects);
}

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  selectedIndex = -1;
  updateProjects();
});

updateProjects();