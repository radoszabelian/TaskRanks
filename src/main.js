var taskRanksBL = (function (_serviceModule) {
    let _module = {};

    let currentRank = 0;
    let currentTier = 0;
    let completedTasks = 0;
    let taskPerRank = 0;
    let allRanksCount = 0;

    _module.getCurrentRank = () => {
        return currentRank;
    };

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
                allRanksCount = data.allRanksCount;
                computeRankStates();
                resolve();
            });
        })
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

var uiController = (function (_blModule) {
    let _module = {};

    function generateTierStripesTo(element) {
        for (let i = 1; i < _blModule.getCurrentTier(); i++) {
            let tierStripeTemplate = document.querySelector("#_templates > ._tier_star_template").cloneNode(true);
            element.appendChild(tierStripeTemplate);
        }
    }

    _module.refreshUi = () => {
        _blModule.refreshData().then(() => {
            let completedTasksElement = document.getElementById("_completed-tasks-count");
            let progressBarElement = document.getElementById("_progress-bar");
            let progressTitleElement = document.getElementById("_progress-title");
            let rankImageElement = document.getElementById("_rank-image");
            let tierTitleElement = document.getElementById("_tier_title");
            let tierStripesContainerElement = document.getElementById("_tier-stripe-container");

            completedTasksElement.innerHTML = taskRanksBL.getCompletedTasks();
            progressBarElement.setAttribute("style", `width: ${taskRanksBL.getProgressPercentage()}%`);
            progressTitleElement.innerHTML = `LEVEL ${taskRanksBL.getCurrentRank()}`;
            rankImageElement.setAttribute("src", `assets/ranks/hu/${taskRanksBL.getCurrentRank()}.svg`)
            tierTitleElement.innerHTML = taskRanksBL.getCurrentTier();
            generateTierStripesTo(tierStripesContainerElement);
        });
    };

    return _module;
});

var dataService = (function () {
    let _module = {};

    _module.getData = () => {
        return new Promise((resolve, reject) => {
            resolve({
                completedTasks: 0,
                taskPerRank: 50,
                allRanksCount: 20
            });
        });
    };

    return _module;
});

var dataService = dataService();
var taskRanksBL = taskRanksBL(dataService);
var uiController = uiController(taskRanksBL);