// List of allowed English editions
const allowedEditions = [
  "eng-bukhari",
  "eng-muslim",
  "eng-nasai",
  "eng-abudawud",
  "eng-tirmidhi",
  "eng-ibnmajah",
  "eng-malik",
];

// Function to pick a random element from an array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to fetch metadata
async function fetchMetadata(edition) {
  try {
    const response = await fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}.json`
    );
    if (!response.ok) throw new Error("Failed to load volume data");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch metadata: " + error.message);
  }
}

// Function to get sections from metadata
function getSectionsFromMetadata(metadata) {
  if (!metadata || !metadata.metadata || !metadata.metadata.sections) {
    throw new Error("No valid sections found");
  }
  return Object.entries(metadata.metadata.sections).map(([number, title]) => ({
    number,
    title,
  }));
}

// Function to fetch section data
async function fetchSectionData(edition, sectionNumber) {
  try {
    const response = await fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}/sections/${sectionNumber}.json`
    );
    if (!response.ok) throw new Error("Failed to load section data");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch section data: " + error.message);
  }
}

// Function to update the HTML content and adjust the popup height
function updateHTML(hadith, section, bookName) {
  const hadithText = hadith.text || "Hadith text not available";
  document.getElementById("hadith-text").innerText = hadithText;
  document.getElementById("details").innerHTML = `
            <p>Book Name: ${bookName}</p>
            <p>Section Number: ${section.number}</p>
            <p>Section Title: ${section.title}</p>
            <p>Hadith Number: ${hadith.hadithnumber || "N/A"}</p>
        `;

  adjustPopupHeight();
}

// Function to dynamically adjust the popup height
function adjustPopupHeight() {
  const hadithCard = document.getElementById("hadith-card");
  const detailsCard = document.getElementById("details-card");
  const generateButton = document.getElementById("generate-button");

  const totalHeight =
    hadithCard.offsetHeight +
    detailsCard.offsetHeight +
    generateButton.offsetHeight +
    60; // 60 for padding and margins
  document.body.style.height = `${totalHeight}px`;
}
// function to shift between dark and light mode
function toggleTheme() {
  const themeIcon = document.getElementById("theme-icon");
  const elements = document.querySelectorAll(
    "body, header, .card, #generate-button"
  );

  if (themeIcon.textContent === "wb_sunny") {
    themeIcon.textContent = "brightness_3";
    elements.forEach((el) => el.classList.add("dark-mode"));
  } else {
    themeIcon.textContent = "wb_sunny";
    elements.forEach((el) => el.classList.remove("dark-mode"));
  }
}

// Event listeners for navigation icons
document.getElementById("theme-icon").addEventListener("click", toggleTheme);
document
  .getElementById("close-icon")
  .addEventListener("click", () => window.close());

// Event listener for the generate button
document
  .getElementById("generate-button")
  .addEventListener("click", fetchRandomHadith);

// Main function to fetch and display a random Hadith
async function fetchRandomHadith() {
  try {
    const edition = getRandomElement(allowedEditions);
    const metadata = await fetchMetadata(edition);
    const sections = getSectionsFromMetadata(metadata);

    if (sections.length === 0) throw new Error("No sections found");

    const randomSection = getRandomElement(sections);
    const sectionData = await fetchSectionData(edition, randomSection.number);
    const hadiths = sectionData.hadiths || [];

    if (hadiths.length === 0)
      throw new Error("No Hadiths found in the section");

    const randomHadith = getRandomElement(hadiths);
    updateHTML(randomHadith, randomSection, metadata.metadata.name);
  } catch (error) {
    console.error("Failed to load Hadith data:", error);
    document.getElementById("hadith-text").innerText =
      "Failed to load Hadith data. Please try again later.";
    document.getElementById("details").innerHTML = "";
  }
}

// Initial call to fetch and display a random Hadith
fetchRandomHadith();

// Function to copy Hadith text to clipboard
function copyHadithText() {
  const hadithText = document.getElementById("hadith-text").textContent;
  const hadithDetails = document.getElementById("details").textContent;
  const fullText = `${hadithText}\n\n${hadithDetails}`;

  navigator.clipboard
    .writeText(fullText)
    .then(() => {
      alert("Hadith and references copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
}

// Add event listener to the copy button
document.addEventListener("DOMContentLoaded", () => {
  const copyButton = document.getElementById("copy-icon");
  if (copyButton) {
    copyButton.addEventListener("click", copyHadithText);
  }
});
