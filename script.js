document.addEventListener('DOMContentLoaded', () => {
            // --- FIXED: API Configuration ---
            const API_MODEL = 'gemini-1.5-flash-latest';
            // IMPORTANT: Replace the placeholder with your actual Google AI Studio API key
            // const apiKey = "AIzaSyD4xwKx3T0DrB19pdjfAuK8ezrf2bXkVY4";
            // const apiKey = process.env.apiKey;
            // const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${apiKey}`;
            const API_URL = '/.netlify/functions/callGemini';

            // --- Mobile Navigation Menu ---
            const hamburger = document.getElementById('hamburger');
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
            const bars = hamburger.children;

            hamburger.addEventListener('click', () => {
                mobileMenu.classList.toggle('translate-x-full');
                document.body.classList.toggle('overflow-hidden');
                bars[0].classList.toggle('rotate-45');
                bars[0].classList.toggle('translate-y-2');
                bars[1].classList.toggle('opacity-0');
                bars[2].classList.toggle('-rotate-45');
                bars[2].classList.toggle('-translate-y-2');
            });

            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('translate-x-full');
                    document.body.classList.remove('overflow-hidden');
                    bars[0].classList.remove('rotate-45', 'translate-y-2');
                    bars[1].classList.remove('opacity-0');
                    bars[2].classList.remove('-rotate-45', '-translate-y-2');
                });
            });

            // --- Scroll Reveal Animation ---
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal-card').forEach((card) => observer.observe(card));

            // --- Random Quote Generator ---
            const quotes = [
                { quote: "If you win, you live. If you lose, you die. If you don't fight, you can't win!", character: "Eren Yeager" },
                { quote: "This world is cruel... but it is also very beautiful.", character: "Mikasa Ackerman" },
                { quote: "The only thing we're allowed to do is to believe that we won't regret the choice we made.", character: "Levi Ackerman" },
                { quote: "To surpass monsters, you must be willing to abandon your humanity.", character: "Armin Arlert" },
                { quote: "What is the point if those with the means and power do not fight?", character: "Eren Yeager" },
                { quote: "A good person? Well... I don't really like that term. To me, it just seems to mean someone who's good for you. And I don't think there's any one person who's good for everyone.", character: "Armin Arlert" },
                { quote: "No matter what kind of wisdom dictates you the option you should pick, no one will be able to tell if it's right or wrong until you arrive to some sort of outcome.", character: "Levi Ackerman" },
                { quote: "Once I'm dead, I won't be able to remember you. So I'll win, no matter what. I'll live, no matter what!", character: "Mikasa Ackerman" },
                { quote: "My soldiers do not buckle or yield when faced with the cruelty of this world. My soldiers push forward! My soldiers scream out! My soldiers RAGE!", character: "Erwin Smith" }
            ];
            const quoteTextElem = document.getElementById('quote-text');
            const quoteCharElem = document.getElementById('quote-character');
            const newQuoteBtn = document.getElementById('new-quote-btn');
            let currentQuoteIndex = 0;

            function displayRandomQuote() {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * quotes.length);
                } while (quotes.length > 1 && randomIndex === currentQuoteIndex);
                currentQuoteIndex = randomIndex;
                const randomQuote = quotes[currentQuoteIndex];
                quoteTextElem.style.opacity = 0;
                quoteCharElem.style.opacity = 0;
                setTimeout(() => {
                    quoteTextElem.textContent = `"${randomQuote.quote}"`;
                    quoteCharElem.textContent = `- ${randomQuote.character}`;
                    quoteTextElem.style.opacity = 1;
                    quoteCharElem.style.opacity = 1;
                }, 300);
            }
            if (newQuoteBtn) { newQuoteBtn.addEventListener('click', displayRandomQuote); }

            const callGeminiApi = async (promptOrHistory, isJson = false, retries = 3, delay = 1000) => {
                // Check if an API key is provided
                // if (apiKey === "YOUR_API_KEY_HERE") {
                //     const errorMsg = "API Key is missing. Please add your Google AI Studio API key in the script.";
                //     console.error(errorMsg);
                //     // Return this message to the UI elements
                //     return errorMsg;
                // }

                // Dynamically create the payload based on whether we get a string or an array (for history)
                const payload = {
        promptOrHistory,
        isJson
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            // No need for Content-Type header here, the body will be stringified automatically
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // The response from our function is the full Gemini result
        const result = await response.json();

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
            return text;
        } else {
            console.error("API call succeeded but returned no text.", result);
            throw new Error("Invalid response structure from API. The response may have been blocked.");
        }
    } catch (error) {
        console.error("API Call failed:", error);
        if (retries > 0) {
            await new Promise(res => setTimeout(res, delay));
            return callGeminiApi(promptOrHistory, isJson, retries - 1, delay * 2);
        } else {
            return null; // Return null or an error message
        }
    }
};

            // --- Backstory Generator ---
            const generateBtn = document.getElementById('generate-btn');
            const nameInput = document.getElementById('name-input');
            const resultText = document.getElementById('result-text');
            const backstoryLoader = document.getElementById('backstory-loader');

            generateBtn.addEventListener('click', async () => {
                const name = nameInput.value.trim();
                if (!name) {
                    resultText.textContent = "Please enter a name to generate a backstory.";
                    return;
                }
                resultText.style.display = 'none';
                backstoryLoader.style.display = 'block';
                generateBtn.disabled = true;

                const prompt = `You are a storyteller from the world of Attack on Titan. Create a compelling, short backstory (3-4 paragraphs) for a new character named ${name}. The backstory should be grounded in the lore, have a slightly grim, determined tone, and include:
1. Their district of origin (e.g., Shiganshina, Trost, Karanes, a wealthy inner district, or an isolated village).
2. Their motivation for joining a military branch (Survey Corps, Garrison, Military Police) or staying a civilian.
3. A defining, brief memory or event that shaped them.
Do not greet the user or use introductory phrases, just provide the story.`;

                const backstory = await callGeminiApi(prompt);
                resultText.textContent = backstory || "Failed to generate backstory. The scouts might be busy fighting titans. Please try again later.";
                backstoryLoader.style.display = 'none';
                resultText.style.display = 'block';
                generateBtn.disabled = false;
            });

            // --- Personality Test ---
            const quizContainer = document.getElementById('quiz-container');
            const quizStartView = document.getElementById('quiz-start');
            const startQuizBtn = document.getElementById('start-quiz-btn');
            const quizQuestionView = document.getElementById('quiz-question-view');
            const questionText = document.getElementById('question-text');
            const optionsContainer = document.getElementById('options-container');
            const nextQuestionBtn = document.getElementById('next-question-btn');
            const quizResultView = document.getElementById('quiz-result-view');
            const resultCharName = document.getElementById('result-character-name');
            const resultCharImage = document.getElementById('result-character-image');
            const resultExplanation = document.getElementById('result-explanation');
            const retakeQuizBtn = document.getElementById('retake-quiz-btn');
            const quizLoader = document.getElementById('quiz-loader');

            let quizQuestions = [];
            let userAnswers = [];
            let currentQuestionIdx = 0;

            const characterImages = {
                "Eren Yeager": "Eren Yeager.jpg",
                "Mikasa Ackerman": "Mikasa Ackerman.jpg",
                "Armin Arlert": "Armin.jpg",
                "Levi Ackerman": "levi.jpg",
                "Erwin Smith": "Erwin_Smith.webp" // Using a fallback image as he is not in the characters section
            };

            const startQuiz = async () => {
                quizStartView.style.display = 'none';
                quizLoader.style.display = 'block';

                const prompt = `Generate 5 personality quiz questions for an 'Attack on Titan' fan. Each question should have 4 unique multiple-choice answers. The questions should be situational or ethical dilemmas relevant to the AoT world, not trivia. Return the result as a valid JSON array of objects. Each object must have two keys: "question" (a string) and "options" (an array of 4 strings).`;
                const questionsJson = await callGeminiApi(prompt, true);

                if (!questionsJson) {
                    quizLoader.style.display = 'none';
                    quizStartView.style.display = 'block';
                    alert("Could not load the quiz. Please try again.");
                    return;
                }

                try {
                    quizQuestions = JSON.parse(questionsJson);
                    currentQuestionIdx = 0;
                    userAnswers = [];
                    quizLoader.style.display = 'none';
                    quizQuestionView.style.display = 'block';
                    displayQuestion();
                } catch (e) {
                    console.error("Failed to parse quiz questions:", e);
                    quizLoader.style.display = 'none';
                    quizStartView.style.display = 'block';
                    alert("Error creating the quiz. Please try again.");
                }
            };

            const displayQuestion = () => {
                const currentQ = quizQuestions[currentQuestionIdx];
                questionText.textContent = `Question ${currentQuestionIdx + 1}/${quizQuestions.length}: ${currentQ.question}`;
                optionsContainer.innerHTML = '';
                currentQ.options.forEach(optionText => {
                    const button = document.createElement('button');
                    button.textContent = optionText;
                    button.className = 'quiz-option w-full p-4 bg-card border border-custom rounded-lg text-left';
                    button.onclick = () => selectOption(button, optionText);
                    optionsContainer.appendChild(button);
                });
                nextQuestionBtn.disabled = true;
            };

            const selectOption = (selectedButton, answer) => {
                // Remove 'selected' class from all options first
                document.querySelectorAll('.quiz-option').forEach(btn => btn.classList.remove('selected'));
                // Add 'selected' class to the clicked option
                selectedButton.classList.add('selected');
                userAnswers[currentQuestionIdx] = answer;
                nextQuestionBtn.disabled = false;
            };

            const nextQuestion = async () => {
                currentQuestionIdx++;
                if (currentQuestionIdx < quizQuestions.length) {
                    displayQuestion();
                } else {
                    await showResult();
                }
            };

            const showResult = async () => {
                quizQuestionView.style.display = 'none';
                quizLoader.style.display = 'block';

                const formattedAnswers = quizQuestions.map((q, i) => `Q: ${q.question}\nA: ${userAnswers[i]}`).join('\n\n');
                const prompt = `You are an expert 'Attack on Titan' character analyst. Based on these Q&As, determine which character the user is most like. Possible characters: ${Object.keys(characterImages).join(", ")}.
Provide the character's full name and a short paragraph explaining why their answers align with that character's personality. Return a valid JSON object with two keys: "character" (the character's full name as a string) and "explanation" (the justification paragraph as a string).

Q&As:
${formattedAnswers}`;

                const resultJson = await callGeminiApi(prompt, true);

                if (!resultJson) {
                    quizLoader.style.display = 'none';
                    quizResultView.innerHTML = '<p>Could not determine your character. Please try again.</p>';
                    quizResultView.style.display = 'block';
                    return;
                }

                try {
                    const result = JSON.parse(resultJson);
                    resultCharName.textContent = result.character;
                    resultExplanation.textContent = result.explanation;
                    resultCharImage.src = characterImages[result.character] || 'https://placehold.co/192/1a1a1a/f0e6d2?text=?';
                    resultCharImage.alt = result.character;

                    quizLoader.style.display = 'none';
                    quizResultView.style.display = 'block';

                } catch (e) {
                    console.error("Failed to parse result:", e);
                    quizLoader.style.display = 'none';
                    quizResultView.innerHTML = '<p>An error occurred while analyzing your result. Please try again.</p>';
                    quizResultView.style.display = 'block';
                }
            };

            const resetQuiz = () => {
                quizResultView.style.display = 'none';
                quizStartView.style.display = 'block';
            };

            startQuizBtn.addEventListener('click', startQuiz);
            nextQuestionBtn.addEventListener('click', nextQuestion);
            retakeQuizBtn.addEventListener('click', resetQuiz);

            // --- NEW: Role-Playing Game Logic ---
            const rpgCharSelectView = document.getElementById('rpg-char-select-view');
            const rpgCharList = document.getElementById('rpg-char-list');
            const rpgGameView = document.getElementById('rpg-game-view');
            const rpgSummaryView = document.getElementById('rpg-summary-view');

            const rpgCharacterName = document.getElementById('rpg-character-name');
            const rpgTurnCounter = document.getElementById('rpg-turn-counter');
            const rpgLog = document.getElementById('rpg-log');
            const rpgLoader = document.getElementById('rpg-loader');
            const rpgScenarioText = document.getElementById('rpg-scenario-text');
            const rpgUserInput = document.getElementById('rpg-user-input');
            const rpgSubmitBtn = document.getElementById('rpg-submit-btn');
            const rpgSummaryText = document.getElementById('rpg-summary-text');
            const rpgRestartBtn = document.getElementById('rpg-restart-btn');

            let selectedCharacter = null;
            let scenarioHistory = [];
            let currentTurn = 0;
            const MAX_TURNS = 3;
            let isGenerating = false;

            const rpgCharacters = {
                "Eren Yeager": "Eren Yeager.jpg",
                "Mikasa Ackerman": "Mikasa Ackerman.jpg",
                "Armin Arlert": "Armin.jpg",
                "Levi Ackerman": "Levi.jpg",
            };

            function initRpg() {
                // Populate character selection list
                rpgCharList.innerHTML = '';
                for (const charName in rpgCharacters) {
                    const card = document.createElement('div');
                    card.className = "reveal-card cursor-pointer bg-card border-2 border-transparent hover:border-accent-red rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-2 p-2 text-center";
                    card.innerHTML = `
            <img src="${rpgCharacters[charName]}" alt="${charName}" class="w-full h-40 object-cover rounded-md">
            <h4 class="mt-2 font-bold">${charName}</h4>
        `;
                    card.addEventListener('click', () => selectRpgCharacter(charName));
                    rpgCharList.appendChild(card);
                    observer.observe(card); // FIX: Observe each dynamically created card
                }
                // The incorrect observer on the parent list has been removed.
                rpgSubmitBtn.addEventListener('click', handleUserAction);
                rpgRestartBtn.addEventListener('click', resetRpg);
            }

            async function selectRpgCharacter(charName) {
                selectedCharacter = charName;
                rpgCharacterName.textContent = `Playing as ${selectedCharacter}`;

                rpgCharSelectView.style.display = 'none';
                rpgGameView.style.display = 'block';

                currentTurn = 1;
                updateTurnCounter();

                setLoadingState(true, "Generating your first scenario...");

                const prompt = `You are a game master for an Attack on Titan text-based RPG. I have chosen to play as ${selectedCharacter}. Start the story by giving me my first scenario. It must be a single, descriptive paragraph ending with a clear situation I need to respond to. Do not ask me what I want to do, just present the scene.`;

                scenarioHistory.push({ role: 'user', parts: [{ text: prompt }] });

                const firstScenario = await callGeminiApi(scenarioHistory);

                if (firstScenario) {
                    scenarioHistory.push({ role: 'model', parts: [{ text: firstScenario }] });
                    updateLog('model', `<strong>Scenario ${currentTurn}:</strong> ${firstScenario}`);
                    setLoadingState(false, firstScenario);
                } else {
                    setLoadingState(false, "Error: Could not generate the first scenario. Please try again.");
                }
            }

            async function handleUserAction() {
                const userInput = rpgUserInput.value.trim();
                if (!userInput || isGenerating) return;

                updateLog('user', `<strong>You:</strong> ${userInput}`);
                rpgUserInput.value = '';

                scenarioHistory.push({ role: 'user', parts: [{ text: `My action is: "${userInput}". Now, generate the next scenario based on my action. Keep it to a single paragraph and present a new situation.` }] });

                currentTurn++;

                if (currentTurn > MAX_TURNS) {
                    await generateFinalSummary();
                } else {
                    updateTurnCounter();
                    setLoadingState(true, "The titans are unpredictable... waiting for the next event...");
                    const nextScenario = await callGeminiApi(scenarioHistory);
                    if (nextScenario) {
                        scenarioHistory.push({ role: 'model', parts: [{ text: nextScenario }] });
                        updateLog('model', `<strong>Scenario ${currentTurn}:</strong> ${nextScenario}`);
                        setLoadingState(false, nextScenario);
                    } else {
                        setLoadingState(false, "Error: Could not generate the next scenario. Please try again.");
                    }
                }
            }

            async function generateFinalSummary() {
                rpgGameView.style.display = 'none';
                rpgSummaryView.style.display = 'block';
                setLoadingState(true, "Compiling your story..."); // This will show loader in the summary view temporarily

                const summaryPrompt = `Based on our entire role-playing conversation history, write a short, cohesive summary of my character's story. Write it in a narrative, past-tense style as a few paragraphs. This is the end of the game.`;
                scenarioHistory.push({ role: 'user', parts: [{ text: summaryPrompt }] });

                const summary = await callGeminiApi(scenarioHistory);

                rpgSummaryText.innerHTML = ''; // Clear previous content/loader
                if (summary) {
                    rpgSummaryText.textContent = summary;
                } else {
                    rpgSummaryText.textContent = "Could not generate a summary of your story. It seems your legend will remain untold for now.";
                }

                // Scroll the RPG section into view
                document.getElementById('role-play').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            function resetRpg() {
                selectedCharacter = null;
                scenarioHistory = [];
                currentTurn = 0;
                rpgLog.innerHTML = '';
                rpgUserInput.value = '';
                rpgSummaryText.textContent = '';

                rpgSummaryView.style.display = 'none';
                rpgGameView.style.display = 'none';
                rpgCharSelectView.style.display = 'block';
            }

            function setLoadingState(isLoading, message = '') {
                isGenerating = isLoading;
                rpgSubmitBtn.disabled = isLoading;
                rpgUserInput.disabled = isLoading;
                if (isLoading) {
                    rpgScenarioText.style.display = 'none';
                    rpgLoader.style.display = 'block';
                    if (rpgSummaryView.style.display === 'block') {
                        rpgSummaryText.innerHTML = '<div class="mx-auto loader"></div>';
                    }
                } else {
                    rpgLoader.style.display = 'none';
                    rpgScenarioText.style.display = 'block';
                    rpgScenarioText.textContent = message;
                }
            }

            function updateLog(role, text) {
                const entry = document.createElement('div');
                entry.className = `rpg-log-entry ${role}`;
                entry.innerHTML = text;
                rpgLog.appendChild(entry);
                rpgLog.scrollTop = rpgLog.scrollHeight; // Auto-scroll to bottom
            }

            function updateTurnCounter() {
                rpgTurnCounter.textContent = `Turn ${currentTurn} / ${MAX_TURNS}`;
            }

            // Initialize the RPG section if it exists on the page
            if (rpgCharList) {
                initRpg();
            }

        });