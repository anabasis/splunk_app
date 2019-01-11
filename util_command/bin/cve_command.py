#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests,os,sys,splunk.Intersplunk,logging,json
import logging.handlers
import smtplib
import gzip

from urllib import urlopen
from StringIO import StringIO

def setup_logger(level):
    logger = logging.getLogger('CVE_COMMAND')
    logger.propagate = False
    logger.setLevel(level)
    file_handler = logging.handlers.RotatingFileHandler(os.environ['SPLUNK_HOME'] + '/logs/CVE_COMMAND.log', maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    return logger

def cve_command(options):
    logger.info("cve_command")

    if not bool(options.get("type")) :
        options["type"] = "recent"

    if not bool(options.get("score")) :
        options["score"] = "9"
    std_score = float(options["score"])

    try:

        url = 'https://nvd.nist.gov/feeds/json/cve/1.0/nvdcve-1.0-'+options["type"]+'.json.gz'
        inmemory = StringIO(urlopen(url).read())
        f = gzip.GzipFile(fileobj=inmemory, mode='rb')
        file_content = f.read()
        data = json.loads(file_content)
        results = list()

        #logger.info(len(data["CVE_Items"]))

        for item in data["CVE_Items"]:
            try:
                score = item["impact"]["baseMetricV2"]["impactScore"]
            except KeyError:
                continue
            #logger.info(score)

            if float(score) >= std_score:
                #logger.info("[CVE] " + item["cve"]["CVE_data_meta"]["ID"])
                cve_id = item["cve"]["CVE_data_meta"]["ID"]
                venders = item["cve"]["affects"]["vendor"]["vendor_data"]
                for vender in venders:
                    #logger.info("[VENDER] " + vender["vendor_name"])
                    products = vender["product"]["product_data"]
                    for product in products:
                        #logger.info("[PRODUCT] " + product["product_name"])
                        versions = product["version"]["version_data"]
                        for version in versions:
                            #logger.info("[VERSION] " + version["version_value"])
                            cve = {}
                            cve['cve_id'] = cve_id
                            cve['score'] = score
                            cve['vendor'] = vender["vendor_name"]
                            cve['product'] = product["product_name"]
                            cve['version'] = version["version_value"]
                            #logger.info(cve)
                            results.append(cve)
        f.close()
        return results
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
#logger.info("START CVE LOOP COMMAND")

#cve_command(results,options)
results = cve_command(options)

# output results
#logger.info("END CVE LOOP COMMAND")
splunk.Intersplunk.outputResults(results)
