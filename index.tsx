import PhotoSwipe from 'photoswipe';

declare global {
    interface Window {
        kakao: any;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // Image loading debugger
    const images = document.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
        img.addEventListener('error', () => {
            const src = img.getAttribute('src');
            const filename = src ? src.split('/').pop() : '알 수 없는 파일';
            
            // Give a more specific error message to the user
            alert(`이미지 로딩 실패!\n\n파일: ${filename}\n\n'index.html' 파일과 같은 위치에 이 파일이 있는지, 파일 이름(대소문자 포함)이 정확한지 확인해주세요.`);
            
            // Visually mark the broken image
            img.style.border = '2px dashed red';
            img.alt = `이미지 로딩 실패: ${filename}`;
        });
    });

    // Accordion for bank account info
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(accordion => {
        accordion.addEventListener('click', () => {
            accordion.classList.toggle('active');
            const content = accordion.nextElementSibling as HTMLElement;
            if (content.style.display === 'flex') {
                content.style.display = 'none';
            } else {
                content.style.display = 'flex';
            }
        });
    });

    // Copy to clipboard
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const textToCopy = (e.target as HTMLElement).getAttribute('data-clipboard-text');
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('계좌번호가 복사되었습니다.');
                }).catch(err => {
                    console.error('Copy failed', err);
                    alert('복사에 실패했습니다.');
                });
            }
        });
    });

    // Guestbook
    const guestbookForm = document.getElementById('guestbook-form') as HTMLFormElement;
    const entriesContainer = document.getElementById('guestbook-entries');

    const loadGuestbookEntries = async () => {
        try {
            const response = await fetch('/api/guestbook');
            const entries = await response.json();
            if (entriesContainer) {
                entriesContainer.innerHTML = '';
                entries.forEach((entry: any) => {
                    const newEntry = document.createElement('div');
                    newEntry.classList.add('guestbook-entry');
                    newEntry.innerHTML = `
                        <p class="meta"><strong>${escapeHTML(entry.name)}</strong> <span class="date">${escapeHTML(entry.date)}</span></p>
                        <p class="message">${escapeHTML(entry.message)}</p>
                    `;
                    entriesContainer.appendChild(newEntry);
                });
            }
        } catch (error) {
            console.error('Error loading guestbook entries:', error);
        }
    };

    if (guestbookForm && entriesContainer) {
        guestbookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('guest-name') as HTMLInputElement;
            const messageInput = document.getElementById('guest-message') as HTMLTextAreaElement;

            const name = nameInput.value.trim();
            const message = messageInput.value.trim();

            if (name && message) {
                const now = new Date();
                const dateString = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                
                const newEntry = {
                    name,
                    message,
                    date: dateString
                };

                try {
                    const response = await fetch('/api/guestbook', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newEntry)
                    });

                    if (response.ok) {
                        guestbookForm.reset();
                        loadGuestbookEntries();
                    } else {
                        alert('방명록 작성에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('Error submitting guestbook entry:', error);
                    alert('방명록 작성 중 오류가 발생했습니다.');
                }
            }
        });

        loadGuestbookEntries();
    }

    // RSVP
    const rsvpButton = document.getElementById('rsvp-btn');
    const rsvpModal = document.getElementById('rsvp-modal');
    const closeBtn = document.querySelector('.close-btn');
    const rsvpForm = document.getElementById('rsvp-form') as HTMLFormElement;
    const guestCountGroup = document.getElementById('guest-count-group');

    if (rsvpButton && rsvpModal && closeBtn && rsvpForm && guestCountGroup) {
        rsvpButton.addEventListener('click', () => {
            if(rsvpModal) rsvpModal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            if(rsvpModal) rsvpModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == rsvpModal) {
                if(rsvpModal) rsvpModal.style.display = 'none';
            }
        });

        const attendanceRadios = rsvpForm.querySelectorAll('input[name="attendance"]');
        attendanceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                if (target.value === 'attending') {
                    guestCountGroup.style.display = 'block';
                } else {
                    guestCountGroup.style.display = 'none';
                }
            });
        });

        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('rsvp-name') as HTMLInputElement;
            const attendanceInput = document.querySelector('input[name="attendance"]:checked') as HTMLInputElement;
            const guestCountInput = document.getElementById('guest-count') as HTMLInputElement;

            const rsvpData = {
                name: nameInput.value,
                attendance: attendanceInput.value,
                guestCount: attendanceInput.value === 'attending' ? parseInt(guestCountInput.value) : 0
            };

            try {
                const response = await fetch('/api/rsvp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(rsvpData)
                });

                if (response.ok) {
                    alert('참석 의사를 전달해주셔서 감사합니다.');
                    if(rsvpModal) rsvpModal.style.display = 'none';
                    rsvpForm.reset();
                } else {
                    alert('참석 의사 전달에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error submitting RSVP:', error);
                alert('참석 의사 전달 중 오류가 발생했습니다.');
            }
        });
    }


    // Scroll-to-top button
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    text: '인이와 설이의 결혼식에 초대합니다.',
                    url: window.location.href
                }).catch(console.error);
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('청첩장 주소가 복사되었습니다.');
                });
            }
        });
    }
    
    // Calculate D-Day
    const weddingDate = new Date('2025-11-01T12:30:00');
    const today = new Date();
    today.setHours(0,0,0,0); //
    
    const timeDiff = weddingDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const dDayElement = document.querySelector('.wedding-day-info');
    if (dDayElement) {
       if (daysLeft > 0) {
            dDayElement.innerHTML = `결혼식이 <strong>${daysLeft}</strong>일 남았습니다.`;
        } else if (daysLeft === 0) {
            dDayElement.innerHTML = `<strong>오늘이 바로 결혼식 날입니다!</strong>`;
        } else {
            dDayElement.textContent = '저희 결혼식에 와주셔서 감사합니다.';
        }
    }

    // PhotoSwipe
    const gallery = document.getElementById('gallery');
    if (gallery) {
        const galleryLinks = Array.from(gallery.querySelectorAll('a'));

        galleryLinks.forEach(link => {
            const img = link.querySelector('img');
            if (img) {
                const image = new Image();
                image.src = link.href;
                image.onload = () => {
                    link.dataset.pswpWidth = image.naturalWidth.toString();
                    link.dataset.pswpHeight = image.naturalHeight.toString();
                };
            }
        });

        gallery.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            if (link) {
                e.preventDefault();
                const index = galleryLinks.indexOf(link);
                const options = {
                    dataSource: galleryLinks.map(a => ({
                        src: a.href,
                        w: parseInt(a.dataset.pswpWidth || '0'),
                        h: parseInt(a.dataset.pswpHeight || '0'),
                        alt: a.querySelector('img')?.alt
                    })),
                    index: index,
                    bgOpacity: 0.85,
                    showHideAnimationType: 'fade'
                };
                const lightbox = new PhotoSwipe(options);
                lightbox.init();
            }
        });
    }

    // Kakao Map
    const loadKakaoMap = () => {
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.VITE_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
        script.onerror = () => {
            const mapContainer = document.getElementById('map');
            if(mapContainer) mapContainer.innerHTML = '지도를 불러오는 데 실패했습니다.';
        }
        script.onload = () => {
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById('map');
                const places = new window.kakao.maps.services.Places();

                // 1. Display Map with Marker for '코엑스 그랜드볼룸'
                places.keywordSearch('코엑스 그랜드볼룸', (result: any, status: any) => {
                    if (status === window.kakao.maps.services.Status.OK) {
                        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                        const mapOption = {
                            center: coords,
                            level: 3
                        };
                        const map = new window.kakao.maps.Map(mapContainer, mapOption);
                        const marker = new window.kakao.maps.Marker({ map: map, position: coords });
                    } else {
                        if(mapContainer) mapContainer.innerHTML = "'코엑스 그랜드볼룸' 위치를 찾지 못했습니다.";
                    }
                });

                // 2. Setup Navigation Buttons for '코엑스 북문주차장'
                const tmapBtn = document.getElementById('tmap-btn') as HTMLAnchorElement;
                const kakaomapBtn = document.getElementById('kakaomap-btn') as HTMLAnchorElement;
                const navermapBtn = document.getElementById('navermap-btn') as HTMLAnchorElement;

                places.keywordSearch('코엑스 북문주차장', (result: any, status: any) => {
                    if (status === window.kakao.maps.services.Status.OK) {
                        const coords = { y: result[0].y, x: result[0].x };
                        const placeName = '코엑스 북문주차장';

                        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                        // TMAP
                        if(tmapBtn) {
                            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                            if (isMobile) {
                                const appUrl = `tmap://route?goalname=${placeName}&goalx=${coords.x}&goaly=${coords.y}`;
                                tmapBtn.href = appUrl;
                            } else {
                                tmapBtn.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    alert('T맵 길안내는 모바일에서만 이용 가능합니다.');
                                });
                            }
                        }

                        // Naver Map
                        if(navermapBtn) {
                            const webUrl = `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`;
                            const appUrl = `nmap://route/public?dname=${placeName}&dx=${coords.x}&dy=${coords.y}`;
                            navermapBtn.href = isMobile ? appUrl : webUrl;
                             if (isMobile) {
                                navermapBtn.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    window.location.href = appUrl;
                                    setTimeout(() => { window.location.href = webUrl; }, 2000);
                                });
                            }
                        }

                        // Kakao Map
                        if(kakaomapBtn) {
                            const webUrl = `https://map.kakao.com/link/to/${placeName},${coords.y},${coords.x}`;
                            kakaomapBtn.href = webUrl;

                            kakaomapBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                if (isMobile) {
                                    const appUrl = `kakaomap://route?name=${placeName}&x=${coords.x}&y=${coords.y}`;
                                    window.location.href = appUrl;
                                    setTimeout(() => { window.location.href = webUrl; }, 2000);
                                } else {
                                    window.open(webUrl, '_blank');
                                }
                            });
                        }
                    }
                });
            });
        };
        document.head.appendChild(script);
    };

    loadKakaoMap();
});


// Helper function to escape HTML to prevent XSS
function escapeHTML(str: string): string {
    return str.replace(/[&<>'"\u0000-\u001f\u007f-\u009f]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
