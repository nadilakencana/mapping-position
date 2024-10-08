document.addEventListener("DOMContentLoaded", function () {
    const map = document.getElementById("map");
    const mapImage = document.querySelector(".map img");

    const createDotElement = (offsetX, offsetY) => {
        const dot = document.createElement("div");
        dot.classList.add("position-dot");
        dot.style.position = "absolute";
        dot.style.top = `${offsetY}px`;
        dot.style.left = `${offsetX}px`;

        dot.innerHTML = `
            <div class="position-detail">
                <div class="header-detail">
                    <p class="text-header">Position target</p>
                    <span class="close">x</span>
                </div>
                <div class="detail">
                    <p class="text-detail-y">Y: ${offsetY.toFixed(0)}</p>
                    <p class="text-detail-x">X: ${offsetX.toFixed(0)}</p>
                    <div class="btn-create-image">
                        <button class="create-img"> + </button>
                    </div>
                </div>
            </div>
            <div class="pop-up-create-image hidden">
                <div class="header-popup">
                    <p class="text-header-popup">Upload Image</p>
                    <span class="close-popup">x</span>
                </div>
                <div class="content-popup">
                    ${createUploadCards(3)}
                </div>
                <div class="btn-submit">
                    <button class="submit-img">upload</button>
                </div>
            </div>
        `;
        return dot;
    };

    const createUploadCards = (count) => {
        let cards = '';
        for (let i = 0; i < count; i++) {
            cards += `
                <div class="card-upload">
                    <span class="text">Upload</span>
                    <input type="file" class="upload-img" style="display:none;">
                </div>
            `;
        }
        return cards;
    };

    mapImage.onclick = (e) => {
        const rect = mapImage.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const newDot = createDotElement(offsetX, offsetY);
        map.appendChild(newDot);
    };

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("close")) {
            e.target.closest(".position-dot").remove();
        } else if (e.target.classList.contains("close-popup")) {
            e.target.closest(".pop-up-create-image").classList.add("hidden");
        } else if (e.target.classList.contains("create-img")) {
            const dotElement = e.target.closest(".position-dot");
            dotElement.querySelector(".pop-up-create-image").classList.remove("hidden");
        } else if (e.target.classList.contains("submit-img")) {
            e.target.closest(".pop-up-create-image").classList.add("hidden");
            getData();
        } else if (e.target.classList.contains("text")) {
            handleFileUpload(e.target.closest(".card-upload"));
        }
    });

    const handleFileUpload = (card) => {
        const inputFile = card.querySelector(".upload-img");
        inputFile.click();

        inputFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                const textElement = card.querySelector(".text");
                reader.onload = function (event) {
                    let previewImage = card.querySelector("img") || document.createElement("img");
                    previewImage.style.maxWidth = "100%";
                    previewImage.style.maxHeight = "100%";
                    previewImage.src = event.target.result;
                    if (textElement) {
                        textElement.style.display = "none";
                    }
                    // Tambahkan ikon hapus
                    let deleteIcon = card.querySelector(".delete-icon") || document.createElement("span");
                    deleteIcon.className = "delete-icon";
                    deleteIcon.textContent = "x"; // Ganti dengan ikon atau simbol hapus
                    deleteIcon.style.position = "absolute";
                    deleteIcon.style.color = "red";
                    deleteIcon.style.top = "5px";
                    deleteIcon.style.right = "5px";
                    deleteIcon.style.cursor = "pointer";
                   
                    // Hapus gambar ketika ikon klik
                    deleteIcon.addEventListener("click", function () {
                        previewImage.remove(); // Hapus gambar
                        deleteIcon.remove();   // Hapus ikon hapus
                        textElement.style.display = "block";
                        updateDataArray(card); // Perbarui data array
                        
                    });

                    let fileNameDisplay = card.querySelector(".file-name");
                    if (!fileNameDisplay) {
                        fileNameDisplay = document.createElement("p");
                        fileNameDisplay.className = "file-name"; // Tambahkan kelas untuk styling jika diperlukan
                        card.appendChild(fileNameDisplay);
                    }
                    fileNameDisplay.textContent = file.name; // Tampilkan nama file

                    card.appendChild(previewImage);
                    card.appendChild(deleteIcon);

                    
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const getData = () => {
        const data = [];
        const dots = document.querySelectorAll(".position-dot");

        dots.forEach((dot) => {
            const y = dot.offsetTop;
            const x = dot.offsetLeft;
            const fileInputs = dot.querySelectorAll(".card-upload input[type='file']");
            const srcArray = [];

            const promises = Array.from(fileInputs).flatMap((input) => {
                if (input.files.length > 0) {
                    return Array.from(input.files).map((file) => {
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                srcArray.push(e.target.result);
                                resolve();
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        });
                    });
                }
                return [];
            });

            // Tunggu sampai semua file dari dot ini diproses
            Promise.all(promises).then(() => {
                if (srcArray.length > 0) {
                    data.push({ y, x, src: srcArray });
                }
                console.log(data); // Log setiap kali data diperbarui
            }).catch((error) => {
                console.error("Error reading files:", error);
            });
        });
    };
    const updateDataArray = (card) => {
        const dot = card.closest('.position-dot');
        const y = dot.offsetTop;
        const x = dot.offsetLeft;

        // Ambil semua file yang tersisa di elemen tersebut
        const fileInputs = dot.querySelectorAll(".card-upload input[type='file']");
        const srcArray = [];

        fileInputs.forEach(input => {
            if (input.files.length > 0) {
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = function (e) {
                    srcArray.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        // Perbarui data array dengan src baru
        const dataIndex = data.findIndex(item => item.y === y && item.x === x);
        if (dataIndex !== -1) {
            data[dataIndex].src = srcArray;
            if (srcArray.length === 0) {
                data.splice(dataIndex, 1); // Hapus data jika tidak ada file tersisa
            }
        }
        console.log(data); // Cek data yang diperbarui
    };
});
