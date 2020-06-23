const emojis = ['images/unamused.png', 'images/slightsmile.png', 'images/winking.png', 'images/smilingeyes.png', 'images/fire.png'];

chrome.storage.sync.get(['start-date'], (result) => {
    const start = result['start-date'] || (new Date()).setHours(0, 0, 0, 0);
    if(!result['start-date'])
        chrome.storage.sync.set({'start-date': start});

    const diff = Date.now() - start;
    const day = parseInt(diff / 86400000);
    const first = day - (day % 49);
    
    function resync() {
        chrome.storage.sync.get(null, (res) => {
            for (let key in res) {
                $(`.dot#${key}`).attr('progress', res[key]);
            }

            let streak = 0;
            while(res[day - streak - 1] == 'completed') streak++;
            if(res[day] == 'completed') streak++;
            
            const emoji = emojis[Math.min(streak, emojis.length - 1)];

            if(emoji == emojis[emojis.length - 1])
                $('.streak').show();
            else $('.streak').hide();
            
            $('.streak').text(streak);
            $('.emoji').attr('src', emoji).css('display', 'inline-block');
        });
    }

    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (let key in changes) {
            $(`.dot#${key}`).attr('progress', changes[key].newValue);
        }

        resync();
    });

    $(document).ready(function() {
        for(let i = 0; i < 7; i++) {
            let row = $('<div/>').addClass('row');
            for(let j = 0; j < 7; j++) {
                const ind = first + (i * 7) + j;
                let item = $('<div/>').addClass('item').appendTo(row);
                let dot = $('<div/>').addClass('dot').appendTo(item).attr('id', ind);

                if(ind > day)
                    item.addClass('upcoming');
                item.on('click', () => {
                    let progress = dot.attr('progress');
                    chrome.storage.sync.set({[ind]: progress == 'completed' ? 'missed' : 'completed'}, console.log);
                });
            }
            $('.grid').append(row);
        }
        
        resync();
    });
});