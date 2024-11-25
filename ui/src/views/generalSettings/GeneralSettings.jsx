import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {Divider, Input, Radio, TimePicker, Button, RadioGroup, Checkbox} from '@douyinfe/semi-ui';
import {InputNumber} from '@douyinfe/semi-ui';
import Headline from '../../components/headline/Headline';
import {xhrPost} from '../../services/xhr';
import {SegmentPart} from '../../components/segment/SegmentPart';
import {Banner, Toast} from '@douyinfe/semi-ui';
import {IconSave, IconCalendar, IconKey, IconRefresh, IconSignal, IconLineChartStroked, IconSearch} from '@douyinfe/semi-icons';
import './GeneralSettings.less';

function formatFromTimestamp(ts) {
    const date = new Date(ts);
    return `${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`;
}

function formatFromTBackend(time) {
    if (time == null || time.length === 0) {
        return null;
    }
    const date = new Date();
    const split = time.split(':');
    date.setHours(split[0]);
    date.setMinutes(split[1]);
    return date.getTime();
}

const GeneralSettings = function GeneralSettings() {
    const dispatch = useDispatch();
    const [loading, setLoading] = React.useState(true);

    const settings = useSelector((state) => state.generalSettings.settings);

    const [interval, setInterval] = React.useState('');
    const [port, setPort] = React.useState('');
    const [scrapingAntApiKey, setScrapingAntApiKey] = React.useState('');
    const [scrapingAntProxy, setScrapingAntProxy] = React.useState('');
    const [workingHourFrom, setWorkingHourFrom] = React.useState(null);
    const [workingHourTo, setWorkingHourTo] = React.useState(null);
    const [demoMode, setDemoMode] = React.useState(null);
    const [analyticsEnabled, setAnalyticsEnabled] = React.useState(null);

    React.useEffect(() => {
        async function init() {
            await dispatch.generalSettings.getGeneralSettings();
            setLoading(false);
        }

        init();
    }, []);

    React.useEffect(() => {
        async function init() {
            setInterval(settings?.interval);
            setPort(settings?.port);
            setScrapingAntApiKey(settings?.scrapingAnt?.apiKey);
            setWorkingHourFrom(settings?.workingHours?.from);
            setWorkingHourTo(settings?.workingHours?.to);
            setScrapingAntProxy(settings?.scrapingAnt?.proxy || 'datacenter');
            setAnalyticsEnabled(settings?.analyticsEnabled || false);
            setDemoMode(settings?.demoMode || false);
        }

        init();
    }, [settings]);

    const nullOrEmpty = (val) => val == null || val.length === 0;

    const throwMessage = (message, type) => {
        if (type === 'error') {
            Toast.error(message);
        } else {
            Toast.success(message);
        }
    };

    const onStore = async () => {
        if (nullOrEmpty(interval)) {
            throwMessage('Interval may not be empty.', 'error');
            return;
        }
        if (nullOrEmpty(port)) {
            throwMessage('Port may not be empty.', 'error');
            return;
        }
        if (
            (!nullOrEmpty(workingHourFrom) && nullOrEmpty(workingHourTo)) ||
            (nullOrEmpty(workingHourFrom) && !nullOrEmpty(workingHourTo))
        ) {
            throwMessage('Working hours to and from must be set if either to or from has been set before.', 'error');
            return;
        }
        try {
            await xhrPost('/api/admin/generalSettings', {
                interval,
                port,
                scrapingAnt: {
                    apiKey: scrapingAntApiKey,
                    proxy: scrapingAntProxy,
                },
                workingHours: {
                    from: workingHourFrom,
                    to: workingHourTo,
                },
                demoMode,
                analyticsEnabled
            });
        } catch (exception) {
            console.error(exception);
            if(exception?.json?.message != null){
                throwMessage(exception.json.message, 'error');
            }else {
                throwMessage('Error while trying to store settings.', 'error');
            }
            return;
        }
        throwMessage('Settings stored successfully. We will reload your browser in 3 seconds.', 'success');
        setTimeout(()=>{
            location.reload();
        }, 3000);
    };

    return (
        <div>
            {!loading && (
                <React.Fragment>
                    <Headline text="General Settings"/>
                    <div>
                        <SegmentPart
                            name="Interval"
                            helpText="Interval in minutes for running queries against the configured services."
                            Icon={IconRefresh}
                        >
                            <InputNumber
                                min={0}
                                max={1440}
                                placeholder="Interval in minutes"
                                value={interval}
                                formatter={(value) => `${value}`.replace(/\D/g, '')}
                                onChange={(value) => setInterval(value)}
                                suffix={'minutes'}
                            />
                        </SegmentPart>
                        <Divider margin="1rem"/>
                        <SegmentPart name="Port" helpText="Port on which Fredy is running." Icon={IconSignal}>
                            <InputNumber
                                min={0}
                                max={99999}
                                placeholder="Port"
                                value={port}
                                formatter={(value) => `${value}`.replace(/\D/g, '')}
                                onChange={(value) => setPort(value)}
                            />
                        </SegmentPart>
                        <Divider margin="1rem"/>
                        <SegmentPart
                            name="ScrapingAnt Api Key"
                            helpText="The api key for ScrapingAnt is used to be able to scrape Immoscout."
                            Icon={IconKey}
                        >
                            <Input
                                type="text"
                                placeholder="ScrapingAnt Api Key"
                                value={scrapingAntApiKey}
                                onChange={(val) => setScrapingAntApiKey(val)}
                            />
                        </SegmentPart>
                        <Divider margin="1rem"/>
                        <SegmentPart
                            name="ScrapingAnt proxy settings"
                            helpText="Scraping ant provides different proxies."
                            Icon={IconKey}
                        >
                            <Banner
                                fullMode={false}
                                type="info"
                                closeIcon={null}
                                title={
                                    <div style={{fontWeight: 600, fontSize: '14px', lineHeight: '20px'}}>
                                        ScrapingAnt is needed to scrape Immoscout. ScrapingAnt itself is using 2
                                        different types of proxies
                                    </div>
                                }
                                style={{marginBottom: '1rem'}}
                                description={
                                    <div>
                                        <h4>Datacenter-Proxy</h4>
                                        Proxy server located in one of the datacenters across the world. Datacenter
                                        proxies are slower and
                                        more likely to fail, but they are cheaper. A call with a datacenter proxy cost
                                        10 credits.
                                        <h4>Residential-Proxy</h4>
                                        High-quality proxy server located in one of the real people houses across the
                                        world. Datacenter
                                        proxies are faster and more likely to success, but they are more expensive.
                                        <br/>
                                        <br/>
                                        <b>
                                            On the free tier, you have 10.000 credits, so chose your option wisely. Keep
                                            in mind, only
                                            successful calls will be charged.
                                        </b>
                                    </div>
                                }
                            />

                            <RadioGroup value={scrapingAntProxy} onChange={(e) => setScrapingAntProxy(e.target.value)}>
                                <Radio name="datacenter" value="datacenter" checked={scrapingAntProxy === 'datacenter'}>
                                    Datacenter proxy
                                </Radio>
                                <Radio name="residential" value="residential"
                                       checked={scrapingAntProxy === 'residential'}>
                                    Residential proxy
                                </Radio>
                            </RadioGroup>
                        </SegmentPart>
                        <Divider margin="1rem"/>
                        <SegmentPart
                            name="Working hours"
                            helpText="During this hours, Fredy will search for new apartments. If nothing is configured, Fredy will search around the clock."
                            Icon={IconCalendar}
                        >
                            <div className="generalSettings__timePickerContainer">
                                <TimePicker
                                    format={'HH:mm'}
                                    insetLabel="From"
                                    value={formatFromTBackend(workingHourFrom)}
                                    placeholder=""
                                    onChange={(val) => {
                                        setWorkingHourFrom(val == null ? null : formatFromTimestamp(val));
                                    }}
                                />
                                <TimePicker
                                    format={'HH:mm'}
                                    insetLabel="Until"
                                    value={formatFromTBackend(workingHourTo)}
                                    placeholder=""
                                    onChange={(val) => {
                                        setWorkingHourTo(val == null ? null : formatFromTimestamp(val));
                                    }}
                                />
                            </div>
                        </SegmentPart>
                        <Divider margin="1rem"/>

                        <SegmentPart
                            name="Analytics"
                            helpText="Insights into the usage of Fredy."
                            Icon={IconLineChartStroked}
                        >
                            <Banner
                                fullMode={false}
                                type="info"
                                closeIcon={null}
                                title={
                                    <div style={{fontWeight: 600, fontSize: '14px', lineHeight: '20px'}}>
                                        Explanation
                                    </div>
                                }
                                style={{marginBottom: '1rem'}}
                                description={
                                    <div>
                                        Analytics are disabled by default. If you choose to enable them, we will begin tracking the following:<br/>
                                        <ul>
                                            <li>Name of active provider (e.g. Immoscout)</li>
                                            <li>Name of active adapter (e.g. Console)</li>
                                            <li>language</li>
                                            <li>os</li>
                                            <li>node version</li>
                                            <li>arch</li>
                                        </ul>
                                        The data is sent anonymously and helps me understand which providers or adapters are being used the most. In the end it helps me to improve fredy.
                                    </div>
                                }
                            />

                            <Checkbox
                                checked={analyticsEnabled}
                                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                            > Enabled
                            </Checkbox>

                        </SegmentPart>

                        <Divider margin="1rem"/>

                        <SegmentPart
                            name="Demo Mode"
                            helpText="If enabled, Fredy runs in demo mode."
                            Icon={IconSearch}
                        >
                            <Banner
                                fullMode={false}
                                type="info"
                                closeIcon={null}
                                title={
                                    <div style={{fontWeight: 600, fontSize: '14px', lineHeight: '20px'}}>
                                        Explanation
                                    </div>
                                }
                                style={{marginBottom: '1rem'}}
                                description={
                                    <div>
                                        In demo mode, Fredy will not (really) search for any real estates. Fredy is in a lockdown mode. Also
                                        all database files will be set back to the default values at midnight.
                                    </div>
                                }
                            />

                            <Checkbox
                                checked={demoMode}
                                onChange={(e) => setDemoMode(e.target.checked)}
                            > Enabled
                            </Checkbox>

                        </SegmentPart>

                        <Divider margin="1rem"/>
                        <Button type="primary" theme="solid" onClick={onStore} icon={<IconSave/>}>
                            Save
                        </Button>
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};

export default GeneralSettings;
