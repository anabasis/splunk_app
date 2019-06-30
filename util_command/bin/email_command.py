#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests,os,sys,splunk.Intersplunk,logging,json
import logging.handlers
import smtplib

from email.MIMEMultipart import MIMEMultipart
from email.MIMEBase import MIMEBase
from email.MIMEText import MIMEText
from email import Encoders
from email import Utils
from email.header import Header

def setup_logger(level):
    logger = logging.getLogger('MAIL_COMMAND')
    logger.propagate = False
    logger.setLevel(level)
    file_handler = logging.handlers.RotatingFileHandler(os.environ['SPLUNK_HOME'] + '/logs/MAIL_COMMAND.log', maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger

def mail_command(result,options):
    logger.info("mail_command")
    #logger.info("result : %s %s " ,result,type(result))

    i_subject = ''
    i_to_mail = ''
    i_from_mail = ''
    i_contents = ''

    try:

        logger.info(result["subject"])
        logger.info(result["to"])
        logger.info(result["from"])
        logger.info(result["contents"])

        if options.has_key("subject"):
            i_subject = options.get('subject')
        else:
            i_subject = result["subject"]

        if options.has_key("from"):
            i_from_mail = options.get('from')
        else:
            i_from_mail = result["from"]

        if options.has_key("to"):
            i_to_mail = options.get('to')
        else:
            i_to_mail = result["to"]

        if options.has_key("contents"):
            i_contents = options.get('contents')
        else:
            i_contents = result["contents"]

        MESSAGE = MIMEMultipart('alternative')
        MESSAGE['subject'] = Header(s=i_subject,charset="utf-8")

        MESSAGE = MIMEMultipart('alternative')
        MESSAGE['subject'] = Header(s=i_subject,charset="utf-8")

        MESSAGE['To'] = i_to_mail
        MESSAGE['From'] = i_from_mail
        html = i_contents

        HTML_BODY = MIMEText(html,'html',_charset="utf-8")
        MESSAGE.attach(HTML_BODY)

        gmail_user = i_from_mail
<<<<<<< HEAD
        gmail_password = "<<페스워드>>"
=======
        # SMTP 메일 PW 입력
        gmail_password = "SMTP메일계정PW"
>>>>>>> d2ae66d95cb198ccf382084060e803a6c94c9ecd

        to_mail = i_to_mail.split(";")

        #server = smtplib.SMTP('smtp.gmail.com:587')
<<<<<<< HEAD
        server = smtplib.SMTP('<<SMTP주소>>')
=======
        server = smtplib.SMTP('smtp메일주소')
>>>>>>> d2ae66d95cb198ccf382084060e803a6c94c9ecd
        server.ehlo()
        server.starttls()
        server.login(gmail_user,gmail_password)
        server.sendmail(gmail_user,to_mail, MESSAGE.as_string())
        server.close()

        logger.info("subject : " + i_subject)
        logger.info("to_mail : " + i_to_mail)
        logger.info("from_mail : " + i_from_mail)
        logger.info("contents : " + i_contents)
        return result["_raw"]
    except Exception, e:
        logger.error("[%s LINE] Unexpected error: %s[%s]", sys.exc_info()[-1].tb_lineno, sys.exc_info()[0], sys.exc_info()[1])
        splunk.Interspluk.parseError(e)

logger = setup_logger(logging.DEBUG)

keywords, options = splunk.Intersplunk.getKeywordsAndOptions()
logger.info("keywords : %s %s " ,keywords,type(keywords))
logger.info("options : %s %s " ,options,type(options))

# get the previous search results
results,dummyresults,settings = splunk.Intersplunk.getOrganizedResults()
# for each results, add a 'shape' attribute, calculated from the raw event text
# logger.info("START EMAIL LOOP COMMAND")

for result in results:
    logger.info("    _raw : %s", result["_raw"])
    #result["email"] = getShape(result["_raw"])
    result["email"] = mail_command(result,options)

# output results
splunk.Intersplunk.outputResults(results)
