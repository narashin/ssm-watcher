![image](https://github.com/narashin/ssm-watcher/blob/master/screenshot.png?raw=true)
# SSM-Watcher

# 0. 목적

AWS Session Manager를 통해 접근하는 인스턴스(접근 대상)와 접근 주체, 접근 시간, 접근 장소(Source IP)를 알려준다.

# 1. `setting.yml`

```json
SLACK_WEBHOOK_URL: "" #SLACK WEBHOOK URL
REGION: ap-northeast-2 #Target Region
```

# 2. 그외

SSM Watcher는 Serverless Framework를 이용하여 만들어졌으며 기본적으로 Serverless Framework가 설치되어 있는 환경에서 deploy 가능합니다.

> https://www.serverless.com/
