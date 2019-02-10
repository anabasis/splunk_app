# -*- coding: utf-8 -*-
"""
Created on Thu Mar  1 17:06:13 2018

@author: swkang

자주 사용하는 정규식 모음

 ^x   문자열의 시작을 표현하며 x 문자로 시작됨을 의미한다.
x$    문자열의 종료를 표현하며 x 문자로 종료됨을 의미한다.
 .x   임의의 한 문자의 자리수를 표현하며 문자열이 x 로 끝난다는 것을 의미한다.
 x+   반복을 표현하며 x 문자가 한번 이상 반복됨을 의미한다.
 x?   존재여부를 표현하며 x 문자가 존재할 수도, 존재하지 않을 수도 있음을 의미한다.
 x*   반복여부를 표현하며 x 문자가 0번 또는 그 이상 반복됨을 의미한다.
 x|y  or 를 표현하며 x 또는 y 문자가 존재함을 의미한다.
 (x)  그룹을 표현하며 x 를 그룹으로 처리함을 의미한다.
 (x)(y)    그룹들의 집합을 표현하며 앞에서 부터 순서대로 번호를 부여하여 관리하고 x, y 는 각 그룹의 데이터로 관리된다.
 (x)(?:y)  그룹들의 집합에 대한 예외를 표현하며 그룹 집합으로 관리되지 않음을 의미한다. 
 x{n}      반복을 표현하며 x 문자가 n번 반복됨을 의미한다.
 x{n,}     반복을 표현하며 x 문자가 n번 이상 반복됨을 의미한다.
 x{n,m}    반복을 표현하며 x 문자가 최소 n번 이상 최대 m 번 이하로 반복됨을 의미한다.
 
 [xy]   문자 선택을 표현하며 x 와 y 중에 하나를 의미한다.
 [^xy]  not 을 표현하며  x 및 y 를 제외한 문자를 의미한다.
 [x-z]  range를 표현하며 x ~ z 사이의 문자를 의미한다. 
 \^     escape 를 표현하며 ^ 를 문자로 사용함을 의미한다.
 \b     word boundary를 표현하며 문자와 공백사이의 문자를 의미한다.
 \B     non word boundary를 표현하며 문자와 공백사이가 아닌 문자를 의미한다.
 \d     digit 를 표현하며 숫자를 의미한다. 
 \D     non digit 를 표현하며 숫자가 아닌 것을 의미한다. 
 \s     space 를 표현하며 공백 문자를 의미한다. 
 \S     non space를 표현하며 공백 문자가 아닌 것을 의미한다.
 \t     tab 을 표현하며 탭 문자를 의미한다.
 \v     vertical tab을 표현하며 수직 탭(?) 문자를 의미한다.
 \w     word 를 표현하며 알파벳 + 숫자 + _ 중의 한 문자임을 의미한다. 
 \W     non word를 표현하며 알파벳 + 숫자 + _ 가 아닌 문자를 의미한다. 

"""

import re

# 대상 문자열
#Test_String ='10.2.1.44 - - [01/Mar/2018 08:39:03:141] "GET /cart.do?action=purchase&itemId=EST-20&product_id=FI-SW-01&JSESSIONID=SD10SL2FF4ADFF1 HTTP 1.1" 503 3196 "http://shop.gourmet-shop.com/cart.do?action=purchase&itemId=EST-20&product_id=FI-SW-01" "Opera/9.01 (Windows NT 5.1; U; en)" 970'
Test_String ='10.2.1.44 - - [01/Mar/2018 08:39:03:141] ttt@gmail.com  <form action="/api/join" method="post"></form> 010-1111-2222 991117-1951017 "GET /cart.do?action=purchase&itemId=EST-20&product_id=FI-SW-01&JSESSIONID=SD10SL2FF4ADFF1 HTTP 1.1" 503 3196 "http://shop.gourmet-shop.com/cart.do?action=purchase&itemId=EST-20&product_id=FI-SW-01" "Opera/9.01 (Windows NT 5.1; U; en)" 970'

# 정규식 패턴 문자열
S_ipaddr = '(?P<IPADDR>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
S_date   = '(?P<DATE>\d{1,2}\/\w{3}\/\d{2,4})'
S_time   = '(?P<TIME>\d{1,2}:\d{1,2}:\d{1,2}:\d*)'
S_http_cmd = '(?P<CMD>(GET)|(POST)|(PUT))'
S_http_ver = '(?P<HTTP_VER>HTTP\s[01]\.[01])'
S_uri    = '(?P<URI>\s\/\w*\.do)'
#S_url    = '(?P<URL>(http\:\/\/)[^\"]*)'
#S_url    = '(?P<URL>((https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w_\.-]*)*\/?))'  # http: 불포함 가능
S_url    = '(?P<URL>((https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w_\.-]*)*\/?))'
S_html   = '(\<[a-zA-Z]+[^>]+[\>])([^<]*)(\<\/[a-zA-Z]+\>)'
#S_email  = '(?P<EMAIL>([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}))'         # 대문자를 잡지 않는다
S_email  = '(?P<EMAIL>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})'
S_mobile = '(?P<MOBILE>(010|011|016|017|018|019)-\d{3,4}-\d{4})'
S_ssn    = '(?P<SSN>\d{2}[0-1]\d[0-3]\d-?[1-6]\d{6})'
S_client = '(?P<CLIENT>\w*\/\d*\.\d*[^\"]*)'
S_jsess  = '(JSESSIONID=)(?P<JSESSIONID>[^&^\s]*)'  # 특정값찾기
S_action = '(action=)(?P<action>[^&^\s]*)'
S_itemId = '(itemId=)(?P<itemId>[^&^\s]*)'
S_product_id = '(product_id=)(?P<product_id>[^&^\s]*)'

S_num   = '\s\d+'
S_space = '\s'
#S_etc   = '[-"\']'     # 기타 문자들
#S_urikey = '\w*\=[^\s|^&]*'


#S_date   = '\d{1,2}/\w{3}/\d{2,4}\s\d'

# 컴파일된 패턴
P_ipaddr = re.compile(S_ipaddr)
P_date   = re.compile(S_date)
P_time   = re.compile(S_time)
P_http_cmd = re.compile(S_http_cmd)
P_http_ver = re.compile(S_http_ver)
P_uri    = re.compile(S_uri)
P_url    = re.compile(S_url)
P_html   = re.compile(S_html)
P_email  = re.compile(S_email)
P_mobile = re.compile(S_mobile)
P_ssn    = re.compile(S_ssn)

P_client = re.compile(S_client)
P_jsess  = re.compile(S_jsess)
P_action = re.compile(S_action)
P_itemId = re.compile(S_itemId)
P_product_id = re.compile(S_product_id)

P_num   = re.compile(S_num)
P_space = re.compile(S_space)
#P_etc   = re.compile(S_etc)
#P_urikey = re.compile(S_urikey)

print(" ==================== 매칭 패턴 ======================== ")
print(" Test String = ", Test_String)
print(" IP Addr = ", P_ipaddr.findall(Test_String))
print(" Date =    ", P_date.findall(Test_String))
print(" Time =    ", P_time.findall(Test_String))
print(" HTTP CMD =    ", P_http_cmd.findall(Test_String))
print(" HTTP VER =    ", P_http_ver.findall(Test_String))
print(" URI =      ", P_uri.findall(Test_String))
print(" URL =      ", P_url.findall(Test_String))
print(" HTML =     ", P_html.findall(Test_String))
print(" EMAIL =    ", P_email.findall(Test_String))
print(" MOBILE =   ", P_mobile.findall(Test_String))
print(" SSN    =   ", P_ssn.findall(Test_String))

print(" Client =   ", P_client.findall(Test_String))
print(" JSESSIONID = ",P_jsess.findall(Test_String))
print(" action =  ", P_action.findall(Test_String))
print(" itemId =  ", P_itemId.findall(Test_String))
print(" product_id =",P_product_id.findall(Test_String))

print(" numbers =",P_num.findall(Test_String))
print(" spaces  =",P_space.findall(Test_String))
#print(" 기타 문자들 = ",P_etc.findall(Test_String))
#print(" URIKEY =  ", P_urikey.findall(Test_String))
print(" ==================== 매칭 패턴  End ======================== ")

Out_String = re.sub(P_ipaddr,S_ipaddr,Test_String)
Out_String = re.sub(P_date  ,S_date  ,Out_String)
Out_String = re.sub(P_time  ,S_time  ,Out_String)
Out_String = re.sub(P_http_cmd  ,S_http_cmd  ,Out_String)
Out_String = re.sub(P_http_ver  ,S_http_ver  ,Out_String)
Out_String = re.sub(P_uri   ,S_uri   ,Out_String)
Out_String = re.sub(P_url   ,S_url   ,Out_String)
Out_String = re.sub(P_html   ,S_html   ,Out_String)
Out_String = re.sub(P_email ,S_email ,Out_String)
Out_String = re.sub(P_mobile ,S_mobile ,Out_String)
Out_String = re.sub(P_ssn ,S_ssn ,Out_String)

Out_String = re.sub(P_client,S_client,Out_String)
Out_String = re.sub(P_jsess ,S_jsess ,Out_String)
Out_String = re.sub(P_action,S_action,Out_String)
Out_String = re.sub(P_itemId,S_itemId,Out_String)
Out_String = re.sub(P_product_id,S_product_id,Out_String)

Out_String = re.sub(P_num,S_num,Out_String)
Out_String = re.sub(P_space,S_space,Out_String)
#Out_String = re.sub(P_etc,S_etc,Out_String)
#Out_String = re.sub(P_urikey,S_urikey,Out_String )


print(" Out_String = ", Out_String)



