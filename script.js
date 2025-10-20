const logEl = document.getElementById('log');
const x_super_properties = 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiaGFzX2NsaWVudF9tb2RzIjpmYWxzZSwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzNC4wLjAuMCBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiMTM0LjAuMC4wIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiJodHRwczovL2Rpc2NvcmQuY29tIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjM4NDg4NywiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=';

// テンプレート定義
const templates = {
    announcement: `@everyone

# Raid by NERV
# NERV ON TOP
https://discord.gg/WbGeBK6Xym`,
    
    simple: `# Raid by NERV
# NERV ON TOP
https://discord.gg/WbGeBK6Xym`,
    
    invite: `# Raid by NERV
# NERV ON TOP
.ｇｇ/WbGeBK6Xym`
};

let currentTemplate = 'announcement';
let messageContent = '';

function appendLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logEl.textContent += '\n' + timestamp + ' | ' + message;
    logEl.scrollTop = logEl.scrollHeight;
}

function clearLog() {
    logEl.textContent = '';
}

let shouldStopSpam = false;

const tokensInput = document.getElementById('tokens');
const guildInput = document.getElementById('guildId');
const channelInput = document.getElementById('channelIds');
const messageFileInput = document.getElementById('messageFile');
const messageTextInput = document.getElementById('messageText');
const randomizeCheckbox = document.getElementById('randomize');
const allmentionCheckbox = document.getElementById('allmention');
const delayInput = document.getElementById('delay');
const limitInput = document.getElementById('limit');
const mentionInput = document.getElementById('mentionIds');
const pollTitleInput = document.getElementById('pollTitle');
const pollAnswersInput = document.getElementById('pollAnswers');
const autoFillBtn = document.getElementById('autoFillChannels');
const fetchMentionsBtn = document.getElementById('fetchMentions');
const submitBtn = document.getElementById('submitBtn');
const stopBtn = document.getElementById('stopSpam');
const leaveBtn = document.getElementById('leaveBtn');
const form = document.getElementById('form');

const addArabicCheckbox = document.getElementById('addArabic');
const addJapaneseCheckbox = document.getElementById('addJapanese');
const addKoreanCheckbox = document.getElementById('addKorean');
const addChineseCheckbox = document.getElementById('addChinese');

const randomTexts = {
    arabic: [
        "مرحبا بالعالم",
        "كيف حالك اليوم؟",
        "هذا نص عربي عشوائي",
        "التقنية تتطور بسرعة",
        "الطبيعة جميلة ورائعة",
        "الشمس تشرق من الشرق",
        "الحياة مليئة بالمفاجآت",
        "التعلم مستمر مدى الحياة",
        "الصداقة كنز ثمين",
        "السفر يوسع الآفاق"
    ],
    japanese: [
        "NEVRやん！",
        "あらされてない？？",
        "お疲れw",
        "なー様",
        "NEVR入った方がいい",
        "これまじかるが作ったんやで",
        "まじかる様すご！"
    ],
    korean: [
        "안녕하세요, 세계",
        "오늘 어떠세요?",
        "이것은 무작위 한국어 텍스트입니다",
        "기술은 빠르게 발전하고 있습니다",
        "자연은 아름답고 훌륭합니다",
        "태양은 동쪽에서 떠오릅니다",
        "인생은 놀라움으로 가득합니다",
        "학습은 평생 지속되는 과정입니다",
        "우정은 소중한 보물입니다",
        "여행은 시야를 넓힙니다"
    ],
    chinese: [
        "你好，世界",
        "你今天怎么样？",
        "这是随机的中文文本",
        "技术正在快速发展",
        "自然美丽而奇妙",
        "太阳从东方升起",
        "生活充满惊喜",
        "学习是终身的过程",
        "友谊是珍贵的财富",
        "旅行开阔视野"
    ]
};

function setupTemplateSelection() {
    const templateOptions = document.querySelectorAll('.template-option');
    
    templateOptions.forEach(option => {
        option.addEventListener('click', function() {
            const templateName = this.getAttribute('data-template');
            
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            currentTemplate = templateName;
            
            if (messageTextInput) {
                messageTextInput.value = templates[templateName];
            }
            
            checkFormValidity();
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseList(input) {
    const items = input.split(/[\s,]+/).map(item => item.trim()).filter(item => item);
    return [...new Set(items)];
}

function generateRandomLanguageText() {
    const selectedLanguages = [];
    
    if (addArabicCheckbox.checked) selectedLanguages.push('arabic');
    if (addJapaneseCheckbox.checked) selectedLanguages.push('japanese');
    if (addKoreanCheckbox.checked) selectedLanguages.push('korean');
    if (addChineseCheckbox.checked) selectedLanguages.push('chinese');
    
    if (selectedLanguages.length === 0) return '';
    
    const randomLanguage = selectedLanguages[Math.floor(Math.random() * selectedLanguages.length)];
    const texts = randomTexts[randomLanguage];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    
    return randomText;
}

function getMessageInputType() {
    const fileOption = document.querySelector('.message-option-btn[data-option="file"]');
    const textOption = document.querySelector('.message-option-btn[data-option="text"]');
    const templateOption = document.querySelector('.message-option-btn[data-option="template"]');
    
    if (fileOption.classList.contains('active')) return 'file';
    if (textOption.classList.contains('active')) return 'text';
    if (templateOption.classList.contains('active')) return 'template';
    return 'text';
}

function getMessageContent() {
    const inputType = getMessageInputType();
    
    if (inputType === 'file') {
        return messageContent;
    } else if (inputType === 'text') {
        return messageTextInput.value;
    } else if (inputType === 'template') {
        return templates[currentTemplate];
    } else {
        return messageTextInput.value;
    }
}

async function leaveGuild(token, guildId) {
    const response = await fetch(`https://discord.com/api/v9/users/@me/guilds/${guildId}`, {
        'method': 'DELETE',
        'headers': {
            'Authorization': token,
            'Content-Type': 'application/json',
            'x-super-properties': x_super_properties
        },
        'body': JSON.stringify({'lurking': false}),
        'referrerPolicy': 'no-referrer'
    });
    
    if (response.status === 204) {
        appendLog('✅ 退出成功: ' + token.slice(0, 10) + '*****');
    } else {
        appendLog('❌ ' + token.slice(0, 10) + '***** - 退出失敗(' + JSON.stringify(await response.json()) + ')');
    }
}

messageFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            messageContent = e.target.result;
            appendLog('✅ ファイル読み込み完了: ' + file.name);
            checkFormValidity();
        };
        reader.readAsText(file);
    }
});

if (messageTextInput) {
    messageTextInput.addEventListener('input', function() {
        checkFormValidity();
    });
}

autoFillBtn.addEventListener('click', async () => {
    clearLog();
    const tokens = parseList(tokensInput.value);
    const guildId = guildInput.value.trim();
    
    if (!tokens.length) return appendLog('⚠️ トークンを入力してください');
    if (!guildId) return appendLog('⚠️ サーバーIDを入力してください');
    
    try {
        const response = await fetch(`https://discord.com/api/v9/guilds/${guildId}/channels`, {
            'headers': {
                'Authorization': tokens[0],
                'Content-Type': 'application/json',
                'x-super-properties': x_super_properties
            },
            'referrerPolicy': 'no-referrer'
        });
        
        if (!response.ok) throw new Error(JSON.stringify(await response.json()));
        
        const channels = await response.json();
        const textChannels = channels.filter(channel => channel.type === 0).map(channel => channel.id);
        
        if (!textChannels.length) return appendLog('チャンネルが見つかりません');
        
        channelInput.value = textChannels.join(',');
        appendLog('✅ チャンネル取得完了');
    } catch (error) {
        appendLog('❌ エラー：' + error.message);
    }
});

fetchMentionsBtn.addEventListener('click', async () => {
    clearLog();
    const tokens = parseList(tokensInput.value);
    const guildId = guildInput.value.trim();
    const channels = parseList(channelInput.value);
    
    if (!tokens.length) return appendLog('⚠️ トークンを入力してください');
    if (!guildId) return appendLog('⚠️ サーバーIDを入力してください');
    if (!channels.length) return appendLog('⚠️ チャンネルIDを入力してください');
    
    const ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');
    
    ws.onopen = () => {
        ws.send(JSON.stringify({
            'op': 2,
            'd': {
                'token': tokens[0],
                'properties': {'os':'Windows','browser':'Discord','device':'pc'},
                'intents': 1 << 12
            }
        }));
    };
    
    ws.onmessage = event => {
        const data = JSON.parse(event.data);
        
        if (data.op === 0 && data.t === 'READY') {
            ws.send(JSON.stringify({
                'op': 14,
                'd': {
                    'guild_id': guildId,
                    'typing': false,
                    'activities': false,
                    'threads': true,
                    'channels': {[channels[0]]: [[0, 0]]}
                }
            }));
        }
        
        if (data.t === 'GUILD_MEMBER_LIST_UPDATE') {
            const members = data.d.ops[0].items.map(item => item.member).filter(member => member);
            const userIds = members.map(member => member.user.id);
            
            if (userIds.length) {
                mentionInput.value = userIds.join(',');
                appendLog('✅ userid取得完了');
            } else {
                appendLog('userが見つかりません');
            }
            ws.close();
        }
    };
    
    ws.onerror = () => {
        appendLog('❌ WebSocketエラー');
        ws.close();
    };
});

async function authenticateOnly(token) {
    return new Promise(resolve => {
        const ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');
        
        ws.onopen = () => {
            ws.send(JSON.stringify({
                'op': 2,
                'd': {
                    'token': token,
                    'properties': {'os':'Windows','browser':'Discord','device':'pc'},
                    'intents': 0
                }
            }));
        };
        
        ws.onmessage = event => {
            const data = JSON.parse(event.data);
            if (data.t === 'READY') {
                appendLog('✅ 認証完了: ' + token.slice(0, 10) + '*****');
                ws.close();
                resolve(true);
            } else if (data.t === 'INVALID_SESSION') {
                appendLog('❌ 認証失敗: ' + token.slice(0, 10) + '*****');
                ws.close();
                resolve(false);
            }
        };
        
        ws.onerror = () => {
            appendLog('❌ WebSocket エラー: ' + token.slice(0, 10) + '*****');
            ws.close();
            resolve(false);
        };
        
        ws.onclose = () => {
            resolve(false);
        };
    });
}

async function sendMessage(token, channelId, message, options = {}) {
    const headers = {
        'Authorization': token,
        'Content-Type': 'application/json',
        'x-super-properties': x_super_properties
    };
    
    let finalMessage = message || '';
    
    if (options.addRandomLanguage) {
        const randomText = generateRandomLanguageText();
        if (randomText) {
            finalMessage += '\n' + randomText;
        }
    }
    
    let payload = {'content': finalMessage};
    
    if (options.randomize) {
        payload.content += '\n' + crypto.randomUUID();
    }
    
    if (options.allmention) {
        payload.content = '@everyone\n' + payload.content;
    }
    
    if (options.randomMentions) {
        const randomMention = options.randomMentions[Math.floor(Math.random() * options.randomMentions.length)];
        payload.content = '<@' + randomMention + '>\n' + payload.content;
    }
    
    if (options.pollTitle && options.pollAnswers) {
        payload.poll = {
            'question': {'text': options.pollTitle},
            'answers': options.pollAnswers.map(answer => ({'poll_media': {'text': answer.trim()}})),
            'allow_multiselect': false,
            'duration': 1,
            'layout_type': 1
        };
    }
    
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        'method': 'POST',
        'headers': headers,
        'body': JSON.stringify(payload),
        'referrerPolicy': 'no-referrer'
    });
    
    return response;
}

async function sendMessageWithRetry(token, channelId, message, options = {}, maxRetries = 5, baseDelay = 3000) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            const response = await sendMessage(token, channelId, message, options);
            
            if (response.ok) {
                appendLog('✅ ' + token.slice(0, 10) + '***** - 成功');
                return true;
            } else {
                if (response.status === 429) {
                    const data = await response.json();
                    const delay = (data.retry_after || 1) * 1000;
                    appendLog('⏳  ' + token.slice(0, 10) + '***** - レート制限: ' + delay/1000 + 's');
                    await sleep(delay);
                    retryCount++;
                } else if (response.status === 400) {
                    const data = await response.json();
                    appendLog('❌ ' + token.slice(0, 10) + '***** - 送信エラー(' + response.status + '): ' + (JSON.stringify(data) || '詳細不明'));
                    const authtest = await authenticateOnly(token);
                    if (!authtest) return false;
                } else {
                    const data = await response.json();
                    appendLog('❌ ' + token.slice(0, 10) + '***** - 送信エラー(' + response.status + '): ' + (JSON.stringify(data) || '詳細不明'));
                    return false;
                }
            }
        } catch (error) {
            appendLog('❌ ' + token.slice(0, 10) + '***** - エラー: ' + error.message + ' | 再試行中...');
            await sleep(baseDelay);
            retryCount++;
        }
    }
    
    appendLog('❌ ' + token.slice(0, 10) + '***** - 最大リトライ回数に達しました。');
    return false;
}

function checkFormValidity() {
    const hasTokens = tokensInput.value.trim();
    const hasGuildId = guildInput.value.trim();
    
    const inputType = getMessageInputType();
    let hasMessage = false;
    
    if (inputType === 'file') {
        hasMessage = messageContent.trim();
    } else if (inputType === 'text') {
        hasMessage = messageTextInput.value.trim();
    } else if (inputType === 'template') {
        hasMessage = templates[currentTemplate].trim();
    }
    
    submitBtn.disabled = !(hasTokens && hasGuildId && hasMessage);
}

function setupMessageOptions() {
    const messageOptionBtns = document.querySelectorAll('.message-option-btn');
    const fileInputContainer = document.getElementById('fileInputContainer');
    const textInputContainer = document.getElementById('textInputContainer');
    const templateInputContainer = document.getElementById('templateInputContainer');
    
    messageOptionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const option = this.getAttribute('data-option');
            
            messageOptionBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            fileInputContainer.classList.remove('active');
            textInputContainer.classList.remove('active');
            templateInputContainer.classList.remove('active');
            
            if (option === 'file') {
                fileInputContainer.classList.add('active');
            } else if (option === 'text') {
                textInputContainer.classList.add('active');
            } else if (option === 'template') {
                templateInputContainer.classList.add('active');
            }
            
            checkFormValidity();
        });
    });
}

function setupFileInput() {
    document.getElementById('messageFile').addEventListener('change', function(e) {
        const fileName = this.files[0] ? this.files[0].name : 'ファイルが選択されていません';
        const label = document.getElementById('fileInputLabel');
        const nameDisplay = document.getElementById('fileName');
        
        nameDisplay.textContent = fileName;
        
        if (this.files[0]) {
            label.classList.add('has-file');
            nameDisplay.style.color = '#48bb78';
        } else {
            label.classList.remove('has-file');
            nameDisplay.style.color = '#e53e3e';
        }
    });
}

function setupLanguageOptions() {
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                this.classList.toggle('selected', checkbox.checked);
            } else {
                this.classList.toggle('selected', e.target.checked);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupTemplateSelection();
    setupMessageOptions();
    setupFileInput();
    setupLanguageOptions();
    
    if (messageTextInput) {
        messageTextInput.value = templates[currentTemplate];
    }
    
    checkFormValidity();
});

tokensInput.addEventListener('input', checkFormValidity);
guildInput.addEventListener('input', checkFormValidity);
messageFileInput.addEventListener('change', checkFormValidity);
if (messageTextInput) {
    messageTextInput.addEventListener('input', checkFormValidity);
}

form.addEventListener('submit', async event => {
    event.preventDefault();
    
    const message = getMessageContent();
    if (!message.trim()) {
        appendLog('⚠️ メッセージを入力またはファイルを選択してください');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = '実行中...';
    shouldStopSpam = false;
    stopBtn.disabled = false;
    
    const tokens = parseList(tokensInput.value);
    const guildId = guildInput.value.trim();
    const channels = parseList(channelInput.value);
    const randomize = randomizeCheckbox.checked;
    const allmention = allmentionCheckbox.checked;
    const delay = parseFloat(delayInput.value) || 0;
    const limit = limitInput.value.trim() ? parseInt(limitInput.value) : Infinity;
    const mentions = mentionInput.value.trim() ? parseList(mentionInput.value) : null;
    const pollTitle = pollTitleInput.value.trim() || null;
    const pollAnswers = pollAnswersInput.value.trim() ? parseList(pollAnswersInput.value) : null;
    
    const addRandomLanguage = addArabicCheckbox.checked || addJapaneseCheckbox.checked || addKoreanCheckbox.checked || addChineseCheckbox.checked;
    
    let messageCount = 0;
    
    const sendPromises = tokens.map(token => {
        return async () => {
            let channelIndex = 0;
            while (!shouldStopSpam && messageCount < limit) {
                if (channelIndex >= channels.length) channelIndex = 0;
                const channelId = channels[channelIndex];
                channelIndex++;
                
                const success = await sendMessageWithRetry(
                    token, 
                    channelId, 
                    message,
                    {
                        'randomize': randomize,
                        'randomMentions': mentions,
                        'pollTitle': pollTitle,
                        'pollAnswers': pollAnswers,
                        'allmention': allmention,
                        'addRandomLanguage': addRandomLanguage
                    }
                );
                
                if (success) messageCount++;
                if (messageCount >= limit) {
                    appendLog('✅ 指定数に達しました');
                    break;
                }
                
                if (delay) await sleep(delay * 1000);
            }
        };
    });
    
    await Promise.all(sendPromises.map(send => send()));
    
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    stopBtn.disabled = true;
    submitBtn.textContent = '実行';
    appendLog('✅ 完了');
});

stopBtn.addEventListener('click', () => {
    shouldStopSpam = true;
    appendLog('🛑 操作を停止します...');
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.textContent = '実行';
});

leaveBtn.addEventListener('click', async () => {
    shouldStopSpam = true;
    stopBtn.disabled = true;
    appendLog('🛑 操作を停止します...');
    
    const tokens = parseList(tokensInput.value);
    const guildId = guildInput.value.trim();
    
    if (!tokens.length) return appendLog('⚠️ トークンを入力してください');
    if (!guildId) return appendLog('⚠️ サーバーIDを入力してください');
    
    for (const token of tokens) {
        await leaveGuild(token, guildId);
    }
    
    appendLog('✅ 退出完了');
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.textContent = '実行';
});
