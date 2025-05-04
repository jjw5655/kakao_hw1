const API_KEY = '';
const BASE_URL = 'https://api.themoviedb.org/3';


// 아래 코드는 엔터키 구현하기 전 코드.

// 페이지 로드 시 인기 영화 불러오기
// document.addEventListener('DOMContentLoaded', () => {
//   fetchMovies('/movie/popular');
// });
// // 검색 버튼 클릭
// document.getElementById('search-btn').addEventListener('click', () => {
//   const query = document.getElementById('search-input').value.trim();
//   if (!query) {
//       alert('검색어를 입력해주세요.'); // 검색어 없을 때 알림
//       return;
//   }
//   fetchMovies('/search/movie', `&query=${encodeURIComponent(query)}`);
// });


// 검색 기능 개선: Enter 키 검색 기능 추가
// 페이지 로드 시 인기 영화 불러오기
document.addEventListener('DOMContentLoaded', () => {
  fetchMovies('/movie/popular');

  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  // 검색 실행 로직을 함수로 분리.
  const Search = () => {
    const query = searchInput.value.trim();
    if (!query) {
      alert('검색어를 입력해주세요.'); // 검색어 없을 때 알림
      return;
    }
    fetchMovies('/search/movie', `&query=${encodeURIComponent(query)}`);
  };

  // 1. 기존방식, 검색 버튼 클릭 시 검색 실행
  searchBtn.addEventListener('click', Search); // 버튼 클릭 시 분리된 함수를 호출합니다.

  // 2. 엔터키방식, 검색 입력 필드에서 키를 눌렀을 때 이벤트 감지
  searchInput.addEventListener('keydown', (event) => { // searchInput 요소에 keydown 이벤트 리스너를 추가합니다.
    if (event.key === 'Enter') { // 눌러진 키가 'Enter' 키인지 확인.
      Search();
    }
  });
});


/**
 * TMDB API로부터 영화 목록을 가져오고 화면에 렌더링
 * @param {string} path  - '/movie/popular' 또는 '/search/movie'
 * @param {string} extra - 추가 쿼리(ex: '&query=라라랜드')
 */
function fetchMovies(path, extra = '') {
  fetch(`${BASE_URL}${path}?api_key=${API_KEY}&language=ko-KR&page=1${extra}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      if (data.results.length === 0 && path === '/search/movie') {
        alert('검색 결과가 없습니다.'); // 검색 결과 없을 때 알림
      }
      renderMovies(data.results);
    })
    .catch(err => {
      console.error('Failed to fetch movies:', err);
      alert('영화 정보를 가져오는 데 실패했습니다. 다시 시도해주세요.'); // 에러 발생 시 알림
    });
}


// /**
//  * 영화 카드 생성 및 삽입
//  * @param {Array} movies - TMDB로부터 받은 영화 배열
//  */
// function renderMovies(movies) {
//   const movieList = document.getElementById('movie-list');
//   movieList.innerHTML = ''; // 기존 영화 목록 비우기

//   movies.forEach(movie => {
//     const poster = movie.poster_path
//       ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
//       : ''; // 이미지가 없을 경우 일단 빈 문자열로 둠.
//     const card = `
//       <div class="movie-card" data-id="${movie.id}">
//         <img src="${poster}" alt="${movie.title}">
//         <div class="card-body">
//           <h5 class="card-title">${movie.title}</h5>
//           <p class="card-text">⭐ ${movie.vote_average.toFixed(1)}</p> </div>
//       </div>`;

//     // DOM 요소로 변환하여 추가
//     const cardElement = document.createElement('div');
//     cardElement.innerHTML = card.trim(); // 불필요한 공백 제거
//     cardElement.querySelector('.movie-card').addEventListener('click', () => {
//         fetchMovieDetail(movie.id); // 영화 카드 클릭 시 상세 정보 가져오기
//     });
//     movieList.appendChild(cardElement.firstChild);
//   });
// }


// 이미지가 없는 영화의 경우 이미지 깨지는 것 방지하기
/**
 * 영화 카드 생성 및 삽입
 * @param {Array} movies - TMDB로부터 받은 영화 배열
 */
function renderMovies(movies) {
  const movieList = document.getElementById('movie-list');
  movieList.innerHTML = ''; // 기존 영화 목록 비우기

  movies.forEach(movie => {
    // 이미지가 있을 경우에만 <img> 태그를 생성하고, 없을 경우 빈 문자열을 할당
    const posterHTML = movie.poster_path
      ? `<img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">`
      : ''; // 이미지가 없으면 빈 문자열

    const card = `
      <div class="movie-card" data-id="${movie.id}">
        ${posterHTML} <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text">⭐ ${movie.vote_average.toFixed(1)}</p> </div>
      </div>`;

    // DOM 요소로 변환하여 추가
    const cardElement = document.createElement('div');
    cardElement.innerHTML = card.trim(); // 불필요한 공백 제거
    cardElement.querySelector('.movie-card').addEventListener('click', () => {
      fetchMovieDetail(movie.id); // 영화 카드 클릭 시 상세 정보 가져오기
    });
    movieList.appendChild(cardElement.firstChild);
  });
}



/**
 * 영화 상세 정보를 가져와 모달에 표시
 * @param {number} id - 영화 ID
 */
function fetchMovieDetail(id) {
  fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ko-KR`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(showModal)
    .catch(err => {
      console.error('Failed to fetch movie detail:', err);
      alert('영화 상세 정보를 가져오는 데 실패했습니다.'); // 에러 발생 시 알림
    });
}


/**
 * 모달에 영화 상세 정보 표시
 * @param {Object} m - 단일 영화 상세 데이터
 */
function showModal(m) {
  document.getElementById('modal-title').textContent = m.title;
  document.getElementById('modal-body').innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" alt="${m.title}">
    <p><strong>개봉일:</strong> ${m.release_date || '정보 없음'}</p>
    <p><strong>평점:</strong> ${m.vote_average ? m.vote_average.toFixed(1) : '평점 없음'}</p>
    <p>${m.overview || '줄거리 정보 없음'}</p> `;
  document.getElementById('movie-modal').style.display = 'block'; // 모달 보이기
}

// 모달 닫기 버튼 클릭
document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('movie-modal').style.display = 'none'; // 모달 숨기기
});

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (event) => {
    const modal = document.getElementById('movie-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});