var uiController = (function (_blModule) {
    let _module = {};

    function generateTierStripesTo(element) {
        for (let i = 1; i < _blModule.getCurrentTier(); i++) {
            let tierStripeTemplate = document.querySelector("#_templates > ._tier_star_template").cloneNode(true);
            element.appendChild(tierStripeTemplate);
        }
    }

    _module.addCompletedTask = (event) => {
        let inputElement = document.querySelector("#_edit-input-add");
        if (Number.isInteger(parseInt(inputElement.value)) && parseInt(inputElement.value) >= 0) {
            _blModule.addCompletedTasks(parseInt(inputElement.value)).then(() => {
                _blModule.refreshData().then(() => {
                    _module.refreshUi();
                })
            });
        }
        inputElement.value = 0;
    }

    _module.removeCompletedTask = (event) => {
        let inputElement = document.querySelector("#_edit-input-remove");
        if (Number.isInteger(parseInt(inputElement.value)) && parseInt(inputElement.value) >= 0) {
            _blModule.removeCompletedTasks(parseInt(inputElement.value)).then(() => {
                _blModule.refreshData().then(() => {
                    _module.refreshUi();
                })
            });
        }
        inputElement.value = 0;
    }

    _module.refreshUi = () => {
        _blModule.refreshData().then(() => {
            let completedTasksElement = document.getElementById("_completed-tasks-count");
            let progressBarElement = document.getElementById("_progress-bar");
            let progressTitleElement = document.getElementById("_progress-title");
            let rankImageElement = document.getElementById("_rank-image");
            let tierTitleElement = document.getElementById("_tier_title");
            let tierStripesContainerElement = document.getElementById("_tier-stripe-container");
            let xpContainerElement = document.getElementById("_xp-container");

            completedTasksElement.innerHTML = taskRanksBL.getCompletedTasks();
            progressBarElement.setAttribute("style", `width: ${taskRanksBL.getProgressPercentage()}%`);
            progressTitleElement.innerHTML = `LEVEL ${taskRanksBL.getCurrentRank()}`;
            rankImageElement.setAttribute("src", `assets/ranks/${taskRanksBL.getCurrentRankNation()}/${taskRanksBL.getCurrentRank()}.svg`)
            tierTitleElement.innerHTML = taskRanksBL.getCurrentTier();
            generateTierStripesTo(tierStripesContainerElement);
            xpContainerElement.innerHTML = `[ ${taskRanksBL.getCompletedTasks()} / ${(taskRanksBL.getCurrentRank()) * taskRanksBL.getTaskPerRanks()} ]`;
        });
    };

    return _module;
});

var taskRanksBL = (function (_serviceModule) {
    let _module = {};

    let currentRank = 0;
    let currentTier = 0;
    let completedTasks = 0;
    let taskPerRank = 0;
    let allRanksCount = 0;
    let currentRankNation = "hu";
    let nations = [];

    _module.getCurrentRankNation = () => currentRankNation;

    _module.getCurrentRank = () => {
        return currentRank;
    };

    _module.getTaskPerRanks = () => {
        return taskPerRank;
    }

    _module.getCurrentTier = () => {
        return currentTier;
    }

    _module.getCompletedTasks = () => {
        return completedTasks;
    }

    _module.refreshData = () => {
        return new Promise((resolve, reject) => {
            _serviceModule.getData().then((data) => {
                taskPerRank = data.taskPerRank;
                completedTasks = data.completedTasks;
                currentRankNation = data.currentRankNation;
                allRanksCount = data.allRanksCount;
                nations = data.nations;
                computeRankStates();
                resolve();
            });
        })
    }

    _module.addCompletedTasks = (howMany) => {
        const taskNumberSavePromise = _serviceModule.setCompletedTasksNumber(completedTasks + howMany);
        const currentTierLevelMaximum = currentTier * 1000;
        if (completedTasks + howMany >= currentTierLevelMaximum) {
            const newTier = getNewRandomTier(currentRankNation);
            const tierSavePromise = _serviceModule.saveTier(newTier);
            return Promise.all([taskNumberSavePromise, tierSavePromise]);
        }
        return taskNumberSavePromise;
    }

    _module.removeCompletedTasks = (howMany) => {
        return _serviceModule.setCompletedTasksNumber(completedTasks - howMany);
    }

    function getNewRandomTier(currentTier) {
        let currentIndex = nations.findIndex((value) => value == currentTier);
        let nextindex = currentIndex == nations.length - 1 ? nextindex = 0 : currentIndex + 1;

        return nations[nextindex];
    }

    function getRandomNumber(min, max) {
        return Math.round((Math.random() * max) + min);
    }

    function computeRankStates() {
        currentTier = Math.floor(completedTasks / (allRanksCount * taskPerRank)) + 1;
        currentRank = Math.floor((completedTasks - (allRanksCount * taskPerRank * (currentTier - 1))) / taskPerRank) + 1;
    };

    _module.getProgressPercentage = () => {
        return Math.round((((completedTasks % taskPerRank) / taskPerRank) * 100));
    }

    return _module;
});

var dataService = (function (_db) {
    const collectionName = "tasksData";
    const dataId = "1u9py6jeSm7ANGCKwYS4";

    let _module = {};

    function readDataFromDb() {
        return new Promise((resolve, reject) => {
            _db.collection(collectionName).get().then((querySnapshot) => {
                resolve(querySnapshot.docs[0].data());
            }, err => {
                console.error(err);
                reject(err);
            });
        })
    }

    _module.getData = () => {
        return readDataFromDb();
    };

    _module.setCompletedTasksNumber = (completedTasksNumber) => {
        return mergePropertiesToDb({ completedTasks: completedTasksNumber });
    }

    _module.saveTier = (newTier) => {
        return mergePropertiesToDb({ currentRankNation: newTier });
    }

    function mergePropertiesToDb(objToMerge) {
        return new Promise((resolve, reject) => {
            db.collection(collectionName).doc(dataId).set({
                ...objToMerge
            }, { merge: true }).then(() => {
                resolve();
            }, () => {
                reject();
            })
        })
    }

    return _module;
});

var dataService = dataService(db);
var taskRanksBL = taskRanksBL(dataService);
var uiController = uiController(taskRanksBL);