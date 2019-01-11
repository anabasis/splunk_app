#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests,os,sys,splunk.Intersplunk,logging,json
import logging.handlers
import time
import socket
import re
import urllib2

def setup_logger(level):
    logger = logging.getLogger('KNOXMAIL_COMMAND')
    logger.propagate = False
    logger.setLevel(level)
    file_handler = logging.handlers.RotatingFileHandler(os.environ['SPLUNK_HOME'] + '/logs/KNOXMAIL_COMMAND.log', maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger

def knoxmail_command(result,options):
    #logger.info("knoxmail_command")
    #logger.info("result : %s %s " ,result,type(result))

    i_subject = ''
    i_to_mail = ''
    i_from_mail = ''
    i_contents = ''
    i_mail_type = ''

    try:

        #logger.info(result["subject"])
        #logger.info(result["to"])
        #logger.info(result["from"])
        #logger.info(result["contents"])

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

        if options.has_key("mailtype"):
            i_mailtype = options.get('mailtype')
        else:
            i_mailtype = result["mailtype"]

        if options.has_key("url"):
            i_url = options.get('url')
        else:
            i_url = "http://112.106.189.167:9100/smartbolt/extrlMail"

        url_abuse = i_url + '?restParam='
        params = {}
        params["PROCESS_TY"] = "I"
        params["EMAIL_BDT_CNTNTS_TY"] = 'HTML'
        params["DSPTCH_EMAIL"] = i_from_mail
        params["RCVER_EMAIL"] = i_to_mail
        params["EMAIL_SJ"] = i_subject
        params["EMAIL_BDT"] = i_contents
        i_params = urllib2.quote(json.dumps(params, ensure_ascii=False))

        #logger.info(url_abuse+i_params)

        try:
            req = urllib2.Request(url_abuse+i_params)
            res = urllib2.urlopen(req)
            body = res.read()

            #logger.info("    Response : [%d] %s", res.code, body)
        except Exception, e:
            logger.error("[%s LINE] Unexpected error: %s[%s]", sys.exc_info()[-1].tb_lineno, sys.exc_info()[0], sys.exc_info()[1])

        #logger.info("subject : " + i_subject)
        logger.info("to_mail : " + i_to_mail)
        #logger.info("from_mail : " + i_from_mail)
        #logger.info("mailtype : " + i_mailtype)
        #logger.info("url : " + i_url)
        #logger.info("contents : " + i_contents)
        return result
    except Exception, e:
        logger.error("[%s LINE] Unexpected error: %s[%s]", sys.exc_info()[-1].tb_lineno, sys.exc_info()[0], sys.exc_info()[1])
        splunk.Interspluk.parseError(e)

logger = setup_logger(logging.INFO)

keywords, options = splunk.Intersplunk.getKeywordsAndOptions()
#logger.info("keywords : %s %s " ,keywords,type(keywords))
#logger.info("options : %s %s " ,options,type(options))

# get the previous search results
results,dummyresults,settings = splunk.Intersplunk.getOrganizedResults()
# for each results, add a 'shape' attribute, calculated from the raw event text
#logger.info("START KNOXMAIL LOOP COMMAND")

for result in results:
    #logger.info("    _raw : %s", result["_raw"])
    o_result = knoxmail_command(result,options)

#logger.info("END KNOXMAIL LOOP COMMAND")
# output results
splunk.Intersplunk.outputResults(results)
