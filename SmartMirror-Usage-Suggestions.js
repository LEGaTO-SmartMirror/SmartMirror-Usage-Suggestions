Module.register("SmartMirror-Usage-Suggestions", {
    defaults:{
        textToSpeech: false,
        language: "en",
        timeUntilFistNotification: 10*1000,
        timeIntervalBetweenNotifications: 60*1000
    },
    suggestions: [],

    
    
	start: function() {
        Log.info('Starting module: ' + self.name);
    },
	getDom: function () {
    },
    // Checks if date is today
    isToday : function (currentDate, someDate) {
        return someDate.getDate() == currentDate.getDate() &&
        someDate.getMonth() == currentDate.getMonth() &&
        someDate.getFullYear() == currentDate.getFullYear()
    },
    
    // Checks if date is within next hour
    isSoon : function (currentDate, someDate){
        var self = this
        if(self.isToday(currentDate, someDate)){
            diffMinutes = (someDate.getTime() - currentDate.getTime()) / 60000
            return diffMinutes > 0 && diffMinutes <= 60
        }
        return false
    },

    broadcastNotifications: function(){
        var self = this

        if(!self.stopSuggestion && self.suggestions.length > 0){
            // suggestion = self.suggestions.pop()
            const randomIndex = Math.floor(Math.random() * self.suggestions.length)
            var suggestion = self.suggestions[randomIndex]
            self.sendNotification('USAGE_SUGGESTION', suggestion.suggestedApp)
            //text to speech
            if(self.config.textToSpeech){
                if (self.config.language == "de"){
                    self.sendNotification('SHOW_ALERT', {type: "notification", message: suggestion.messageDE, timer: 6000})
				    self.sendNotification('smartmirror-TTS-ger', suggestion.messageDE);
                }
			    else if (self.config.language == "en"){
                    self.sendNotification('SHOW_ALERT', {type: "notification", message: suggestion.messageEN, timer: 6000})
                    self.sendNotification('smartmirror-TTS-en',  suggestion.messageEN);
                }
				    
            }
            self.suggestions.splice(randomIndex, 1)
            setTimeout(() => {self.broadcastNotifications()}, this.config.timeIntervalBetweenNotifications) 
        }        
    },

    checkRules: function(){
        var self = this
        var d = new Date()
        //check rules
        if( d.getHours() >= 10 && d.getHours() <= 14){
            if(self.foodSpecialAvalable){
                self.suggestions.push({suggestedApp:'mensa' , messageEN: 'There is special food available. Check out the mensa app!', messageDE: 'Es gibt Mensa Spezial! Starte die Mensa App!'})
                self.suggestions.push({suggestedApp:'canteen' , messageEN: 'Dont like the food at the mensa? Check out the Westend canteen menu!', messageDE: 'Dir gefällt das Mensa Menu nicht? Schaue was is im Westend gibt!'})
            } else if (!self.foodSpecialAvalable) {
                self.suggestions.push({suggestedApp:'canteen' , messageEN: 'Dont like the food at the mensa? Check out the Westend canteen menu!', messageDE: 'Dir gefällt das Mensa Menu nicht? Schaue was is im Westend gibt!'})
            } else {
                self.suggestions.push({suggestedApp:'food', messageEN: 'Its lunchtime! Check out lunch menu before you go!', messageDE: 'Mittagszeit! Schaue dir das Menu an bevor du gehst!'})
            }
        }
        if(self.calendarEventToday){
            self.suggestions.push({suggestedApp:'calendar', messageEN: 'There are events today! Check out the calendar app!', messageDE: 'Eine Veranstaltung steht an! Starte die Kalender App!'})
        } 
        if(self.calendarEventToday){
            self.suggestions.push({suggestedApp:'calendar', messageEN: 'An event will start soon! Check out the calendar app!', messageDE: 'Eine Veranstaltung beginnt bald! Starte die Kalender App!'})
        }
        if(d.getHours() > 15){
            self.suggestions.push({suggestedApp:'transport', messageEN: 'Finishing up for today? Check out traffic or public transport situation!', messageDE: 'Feierabend für heute? Entkomme dem Stau mit der Traffic App!'})
            self.suggestions.push({suggestedApp:'fuel', messageEN: 'Fuel prices are the lowes between 6 and 8 pm. Check out the gas prices before you drive home!', messageDE: 'Benzin ist am günstigsten von 18 bis 20 Uhr! Starte die Fuel Prices App!'})
        } 
        if(!(self.weatherCategory.includes('clear') || self.weatherCategory.includes('few clouds') || self.weatherCategory.includes('scattered clouds') || self.weatherCategory.includes('broken clouds'))){
            self.suggestions.push({suggestedApp:'transport', messageEN: 'Bad weather? Check out next transportation departures.', messageDE: 'Schlechtes Wetter? Plane deine Abfahrt mit der Public Transport App!'})
        }
        if(self.newNewsAvalable){
            self.suggestions.push({suggestedApp:'news', messageEN: 'We have updated the news. Check them out!', messageDE: 'Wir haben die Nachrichten aktualisiert! Starte die Nachricten App!'})
            self.newNewsAvalable = false
        }
        if(self.weatherUpdated){
            self.suggestions.push({suggestedApp:'weather', messageEN: 'We have updated the weather. Check it out!', messageDE: 'Es gibt neue Wetter Informationen! Überprüfe das Wetter mit der Wetter App!'})
            self.weatherUpdated = false
        }
        if(self.soccerUpdated){
            self.suggestions.push({suggestedApp:'soccer', messageEN: 'New soccer results available. Start the soccer app!', messageDE: 'Neue Fußballergebnisse sind da! Schau sie dir an mit der Soccer App!'})
            self.weatherUpdated = false
        }
        if(self.numberOfPersons > 1){
            en = ['','','two','three','four', 'five', 'guys']
            ger = ['','','zwei','drei','vier', 'fünf', '']

            if(self.numberOfPersons > en.length){
                self.numberOfPersons = en.length
            }
            self.suggestions.push({suggestedApp:'selfie', messageEN: 'You ' + en[self.numberOfPersons] + ' look great! Make a picture with the peace gesture with both hands!', message: 'Ihr ' + ger[self.numberOfPersons] + ' seht toll aus! Macht ein Selfie mit der Selfie Geste!'})
        }
        if(self.dota2Updated){
            self.suggestions.push({suggestedApp:'dota2', messageEN: 'Don\'t miss out upcoming Dota2 esports matches. Start the esports app!', messageDE: 'Verpasse keine Dota2 Esports Spiele mehr! Starte die Esports App!'})
            self.weatherUpdated = false
        }
        
        
    },

    suggest: function(){
        var self = this
        self.checkRules()
        //broadcast suggestion
        setTimeout(() => {self.broadcastNotifications()}, this.config.timeUntilFistNotification) 
    },

	notificationReceived: function(notification, payload, sender) 
	{
        var self = this
		switch(notification){
            case 'USER_LOGIN':
                if(payload != -1){
                    self.stopSuggestion = false
                    self.suggestions = []
                    self.suggest()
                }else {
                    self.stopSuggestion = true
                    self.suggestions = []
                }
                break;
            case 'CALENDAR_EVENTS':
                calendarEvents = payload
                for (let i = 0; i < calendarEvents.length; i++){
                    eventDate = new Date(parseInt(calendarEvents[i].startDate))
                    self.calendarEventToday = self.isToday(new Date(), eventDate)
                    self.calendarEventSoon = self.isSoon(new Date(), eventDate)
                }
                break;
            case 'MENSA_PLAN':
                mensa = payload
                mensa[1].forEach(function(element) {
                    if(element.name == 'Aktions-Theke'){
                        self.foodSpecialAvalable = true
                    }
                })
                break;
            case 'CURRENTWEATHER_DATA':
                weather = payload
                self.weatherCategory = weather.data.weather[0].description
                break;
            case 'NEWS_UPDATED':
                self.newNewsAvalable = true
                break;
            case 'WEATHER_FORECAST':
                self.weatherUpdated = true
                break;
            case 'CURRENTWEATHER_DATA':
                self.weatherUpdated = true
                break;
            case 'SOCCER_UPDATED':
                self.soccerUpdated = true
                break;
            case 'DOTA2_UPDATED':
                self.dota2Updated = true
                break;
            case 'DETECTED_OBJECTS': //for person detection
                objects = payload.DETECTED_OBJECTS
                numberOfPersons = 0
                objects.forEach((element) => {
                    if (element.name == 'person') {
                        numberOfPersons = numberOfPersons + 1
                    }
                })
                if (self.numberOfPersons != numberOfPersons && numberOfPersons != 0){
                    self.numberOfPersons = numberOfPersons
                }
                break;
            // uncomment the following if you wish to user module visibility for logic checks
            /*
            case 'MODULE_VISIBILITY_STATUS':
                smModule = payload
                switch(smModule.moduleName){
                    case 'clock':
                        self.visibility_clock = smModule.visibility
                        break;
                    case 'calendar':
                        self.visibility_calendar = smModule.visibility
                        break;
                    case 'currentweather':
                        self.visibility_weather = smModule.visibility
                        break;
                    case 'weatherforecast':
                        self.visibility_weather_forecast = smModule.visibility
                        break;
                    case 'newsfeed':
                        self.visibility_newsfeed = smModule.visibility
                        break;
                    case 'MMM-PublicTransportHafas':
                        self.visibility_public_transport = smModule.visibility
                        break;
                    case 'MMM-SoccerLiveScore':
                        self.visibility_soccer = smModule.visibility
                        break;
                    case 'MMM-cryptocurrency':
                        self.visibility_crypto = smModule.visibility
                        break;
                    case 'SmartMirror-Mensa-Plan':
                        self.visibility_mensa = smModule.visibility
                        break;
                    case 'smartmirror-ai-art-mirror':
                        self.visibility_ai_art = smModule.visibility
                        break;
                    case 'smartmirror-speechrecognition':
                        self.visibility_speech_recognition = smModule.visibility
                        break;
                    case 'smartmirror-camera-image':
                        self.visibility_camera_image = smModule.visibility
                        break;
                    case 'smartmirror-facerecognition':
                        self.visibility_face_recognition = smModule.visibility
                        break;
                    case 'SmartMirror-Object-Detection':
                        self.visibility_object_detection = smModule.visibility
                        break;
                    case 'SmartMirror-Gesture-Recognition':
                        self.visibility_gesture_detection = smModule.visibility
                        break;
                    case 'SmartMirror-Person-Recognition':
                        self.visibility_person_recognition = smModule.visibility
                        break;
                    case 'SmartMirror-Short-Distance':
                        self.visibility_short_distance = smModule.visibility
                        break;
                    case 'MMM-TomTomTraffic':
                        self.visibility_traffic = smModule.visibility
                        break;
                    case 'MMM-News':
                        self.visibility_news = smModule.visibility
                        break;
                    
                }
                break;
            */
        }
	},
	socketNotificationReceived: function () {},
})
