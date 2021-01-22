import React from 'react';
import * as d3 from 'd3';

class HourGraph extends React.Component{
    constructor(props){
        super(props)
        this.createGraph = this.createGraph.bind(this)
    }
    componentDidMount() {
        d3.select(this.node).selectAll('.main').remove()
        this.createGraph()
    }
    componentDidUpdate() {
        d3.select(this.node).selectAll('.main').remove()
        this.createGraph()
    }

    createGraph() {
        const node = this.node;
        const margin = {top: 40, left: 80, right:80, bottom:150};
        const width = this.props.width - margin.left - margin.right;
        const height = this.props.height - margin.top - margin.bottom;
        const full_data = this.props.hourly
        let i = 0;
        let j = 12;
        let data = full_data.slice(i,j)
        let look
        if (this.props.look === 'temp'){
            look = this.props.celsius ? 'celsius' : 'farenheit'
        } else {
            look = this.props.look
        }
        let zero
        if (this.props.look === 'temp' && !this.props.celsius){
            zero = Math.max(32, d3.min(full_data, (d) => d[look])-1)
        } else {
            zero = Math.max(0, d3.min(full_data, (d) => d[look])-1)
        }

        let x = d3.scaleTime()
                .domain(d3.extent(data, (d) => d.date))
                .range([0, width]);
        const y = d3.scaleLinear().range([0, height])

        if (this.props.look === 'temp'){
            y.domain([d3.max(full_data, (d) => d[look]) + 1, d3.min(full_data, (d) => d[look]) - 1])
        } else {
            y.domain([100,0])
        }
        const svg = d3.select(node).append('svg').attr('class','main')
                .attr('height', height+margin.top+margin.bottom)
                .attr('width', width+margin.left+margin.right)
                .append('g')
                .attr('transform', 'translate('+margin.left+','+margin.top+')');
        const yAxis = svg.append('g').attr('class','main').attr('class','axis')
                .call(d3.axisLeft(y).ticks(10).tickSize(-width));
        const xAxis = svg.append('g').attr('class','main').attr('class','axis')
                .attr('transform', 'translate(0,' + height +  ')')
                .call(d3.axisBottom(x));
        xAxis.select('.domain').attr('stroke', 'white');
        yAxis.select('.domain').attr('stroke', 'white');
        yAxis.selectAll('text').attr('font-size', 15);
        yAxis.selectAll('line').attr('stroke','gray')
            .attr('stroke-dasharray', 2)

        svg.append('line').attr('y1', y(zero)).attr('y2', y(zero))
            .attr('x1', 0).attr('x2', width)
            .attr('stroke', 'red').attr('stroke-width', 3)
            .attr('opacity', 0.5)

        svg.append('path').datum(data)
        .attr('id','area')
        .attr('fill', look==='precip' ? 'blue' : 'orange')
        .attr('opacity', 0.4)
        .attr('d', d3.line().x((d) => x(d.date)).y(y(zero))).transition().duration(2000)
        .attr('d', d3.area()
            .x((d) => x(d.date))
            .y0(y(zero))
            .y1((d) => y(d[look]))
        )

        svg.append('path').datum(data)
            .attr('id','trace')
            .attr('fill', 'none')
            .attr('stroke-width', 5)
            .attr('stroke', look==='precip' ? 'blue' : 'orange')
            .attr('d', d3.line().x((d) => x(d.date)).y(y(zero))).transition().duration(2000)
            .attr('d', d3.line()
                .x((d) => x(d.date))
                .y((d) => y(d[look]))
        )
        svg.append('rect').attr('x',width-50)
        .attr('width',50).attr('height', height)
        .attr('class', 'next')
        .attr('fill', 'gray')
        .attr('opacity', 0.4)
    svg.append('path')
        .attr('class', 'next')
        .attr('d', `M${width-40},50 L${width-10},${height/2} L${width-40},${height-50}`)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 3)

    svg.append('rect')
        .attr('width',50).attr('height', height)
        .attr('class', 'before')
        .attr('fill', 'gray')
        .attr('opacity', 0.4)
    svg.append('path')
        .attr('class', 'before')
        .attr('d', `M40,50 L10,${height/2} L40,${height-50}`)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 3)

    d3.select(node).append('text').attr('transform', 'translate(' + width / 2 + ',' + `${height+100}` + ')')
        .text(`${data[0].date.toDateString().slice(0,-5)}`)
        .attr('font-size',30).attr('id', 'day').attr('class','main')

    d3.selectAll('.next').on('click', function() {
        if(j>full_data.length-9){
            j = full_data.length;
            i = full_data.length-12
        } else {
            i += 9;
            j += 9;
        }
        data = full_data.slice(i, j)
        redraw(data)
    })

    d3.selectAll('.before').on('click', function() {
        if(i<9){
            i = 0;
            j = 12;
        } else {
            i -= 9;
            j -= 9;
        }
        data = full_data.slice(i, j)
        redraw(data)
    })

    function redraw(data){
        x.domain(d3.extent(data, (d) => d.date))

        xAxis.transition().duration(750).delay(750).call(d3.axisBottom(x));
        d3.select('#day').transition().duration(750).delay(750)
            .text(`${data[0].date.toDateString().slice(0,-5)}`);

        d3.select('#area').datum(data).transition().duration(2000)
            .attr('d', d3.area()
                .x((d) => x(d.date))
                .y0(y(zero))
                .y1((d) => y(d[look]))
            );
        d3.select('#trace').datum(data).transition().duration(2000)
            .attr('d', d3.line()
            .x((d) => x(d.date))
            .y((d) => y(d[look]))
        )
    }
    }
    render() {
        return (
            <svg
                ref={node => this.node = node}
                height={this.props.height}
                width={this.props.width}/>
        )}
}

class RainGraph extends React.Component{
    constructor(props){
        super(props)
        this.createGraph = this.createGraph.bind(this)
    }
    componentDidMount() {
        d3.select(this.node).selectAll('.main').remove()
        this.createGraph()
    }
    componentDidUpdate() {
        this.createGraph()
    }
    createGraph(){
        const node = this.node;
        const margin = {top: 40, left: 80, right:80, bottom:150};
        const width = this.props.width - margin.left - margin.right;
        const height = this.props.height - margin.top - margin.bottom;
        const data = this.props.daily

        const x = d3.scaleBand().range([0,width])
                        .padding(0.3)
                        .domain(data.map((d) => d.date.toDateString().slice(0,-5)))
        const y = d3.scaleLinear().range([0, height]).domain([100,0])

        const svg = d3.select(node).append('svg').attr('class', 'main')
                .attr('height', height+margin.top+margin.bottom)
                .attr('width', width+margin.left+margin.right)
                .append('g')
                .attr('transform', 'translate('+margin.left+','+margin.top+')');
        const yAxis = svg.append('g').attr('class','main').attr('class','axis')
                .call(d3.axisLeft(y).ticks(10)
                    .tickSize(-width));
        const xAxis = svg.append('g').attr('class','main').attr('class','axis')
                .attr('transform', 'translate(0,' + height +  ')')
                .call(d3.axisBottom(x));
        xAxis.select('.domain').attr('stroke', 'white');
        xAxis.selectAll('text').attr('transform', 'rotate(-20)')
            .attr('x', -20).attr('y', 15)
            .attr('font-size', 15);
        yAxis.select('.domain').attr('stroke', 'white');
        yAxis.selectAll('text').attr('font-size', 15);
        yAxis.selectAll('line').attr('stroke','gray')
            .attr('stroke-dasharray', 2)

        svg.append('line').attr('y1', y(0)).attr('y2', y(0))
            .attr('x1', 0).attr('x2', width)
            .attr('stroke', 'red').attr('stroke-width', 3)
            .attr('opacity', 0.5)

        svg.selectAll('bar').data(data).enter().append('rect')
            .attr('fill', 'blue')
            .attr('x', (d) => x(d.date.toDateString().slice(0,-5)))
            .attr('width', x.bandwidth())
            .attr('y', y(0)).attr('height', 0)
            .transition().duration(2000).delay((d,i) => i*200)
            .attr('y', (d) => y(d.precip))
            .attr('height', (d) => y(0) - y(d.precip)+1)

    }
    render(){
        return(
            <svg ref={node => this.node = node}
                height={this.props.height}
                width={this.props.width}/>
        )
    }
}


class BarGraph extends React.Component{
    constructor(props){
        super(props)
        this.createGraph = this.createGraph.bind(this)
    }
    componentDidMount() {
        d3.select(this.node).selectAll('.main').remove()
        this.createGraph()
    }
    componentDidUpdate() {
        d3.select(this.node).selectAll('.main').remove()
        this.createGraph()
    }
    createGraph() {
        const node = this.node;
        const margin = {top: 40, left: 80, right:80, bottom:150};
        const width = this.props.width - margin.left - margin.right;
        const height = this.props.height - margin.top - margin.bottom;
        const degrees = this.props.celsius ? 'celsius' : 'farenheit'
        const data = this.props.daily;

        let zero
        if (!this.props.celsius){
            zero = Math.max(32, d3.min(data, (d) => d[degrees].low)-1)
        } else {
            zero = Math.max(0, d3.min(data, (d) => d[degrees].low)-1)
        }

        const x = d3.scaleBand().range([0,width])
                        .padding(0.7)
                        .domain(data.map((d) => d.date.toDateString().slice(0,-5)))
        const y = d3.scaleLinear().range([0, height])
                    .domain([d3.max(data, (d) => d[degrees].high)+1,d3.min(data, (d) => d[degrees].low)-1])

        const svg = d3.select(node).append('svg').attr('class', 'main')
                .attr('height', height+margin.top+margin.bottom)
                .attr('width', width+margin.left+margin.right)
                .append('g')
                .attr('transform', 'translate('+margin.left+','+margin.top+')');

        const yAxis = svg.append('g').attr('class','main').attr('class','axis')
                .call(d3.axisLeft(y)
                    .ticks(((d3.max(data, (d) => d[degrees].high)+1)-(d3.min(data, (d) => d[degrees].low)-1))/2)
                    .tickSize(-width));
        const xAxis = svg.append('g').attr('class','main').attr('class','axis')
                .attr('transform', 'translate(0,' + height +  ')')
                .call(d3.axisBottom(x));
        xAxis.select('.domain').attr('stroke', 'white');
        xAxis.selectAll('text').attr('transform', 'rotate(-20)')
            .attr('x', -20).attr('y', 15)
            .attr('font-size', 15);
        yAxis.select('.domain').attr('stroke', 'white');
        yAxis.selectAll('text').attr('font-size', 15);
        yAxis.selectAll('line').attr('stroke','gray')
            .attr('stroke-dasharray', 2)

        svg.append('line').attr('y1', y(zero)).attr('y2', y(zero))
            .attr('x1', 0).attr('x2', width)
            .attr('stroke', 'red').attr('stroke-width', 3)
            .attr('opacity', 0.5)

        svg.selectAll('bar').data(data).enter().append('rect')
            .attr('x', (d) => x(d.date.toDateString().slice(0,-5))-x.bandwidth()/2)
        .attr('width', () => x.bandwidth())
        .attr('y', y(zero))
        .style('fill', 'orange')
        .attr('height', 0)
        .transition().duration(2000).delay((d,i) => i*200)
        .attr('y', (d) => d[degrees].high > zero ? y(d[degrees].high) : y(zero))
        .attr('height', (d) => d[degrees].high > zero ? y(zero) - y(d[degrees].high) : y(d[degrees].high) - y(zero)+1)

        svg.selectAll('bar').data(data).enter().append('rect')
            .attr('x', (d) => x(d.date.toDateString().slice(0,-5))+x.bandwidth()/2)
        .attr('width', () => x.bandwidth())
        .attr('y', y(zero))
        .style('fill', 'blue')
        .attr('height', 0)
        .transition().duration(2000).delay((d,i) => i*200)
        .attr('y', (d) => d[degrees].low > zero ? y(d[degrees].low) : y(zero))
        .attr('height', (d) => d[degrees].low > zero ? y(zero) - y(d[degrees].low) : y(d[degrees].low) - y(zero)+1)

        const legend = [{text:'high',fill:'orange'},{text:'low',fill:'blue'}]
        svg.selectAll('circle').data(legend).enter().append('circle')
            .attr('r', 4)
            .attr('cx', width-margin.right)
            .attr('cy', (d,i) => i*15-10)
            .attr('fill', (d) => d.fill);

        svg.selectAll().data(legend).enter().append('text')
            .text((d) => d.text)
            .attr('x', width-margin.right+10)
            .attr('y', (d,i) => i*15-6)
            .attr('font-size', 10);
    }
    render() {
        return (
            <svg
                ref={node => this.node = node}
                height={this.props.height}
                width={this.props.width}/>
        )}

}


class Now extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            daily: [],
            hourly: [],
            celsius: true,
            look: 'temp',
            scope: false
        }
        this.handleClick = this.handleClick.bind(this)
        this.handleLookChange = this.handleLookChange.bind(this)
        this.handleScopeChange = this.handleScopeChange.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
    }

    handleScopeChange(e){
        this.setState(prevState => ({
            scope: !prevState.scope
        }))
    }

    handleLookChange(e){
        this.setState({
            look: e.target.value
        })
    }

    handleClick(){
        this.setState(prevState => ({
            celsius: !prevState.celsius
        }))
    }

    handleEdit(){
        this.props.onEditClick()
    }

    title(s){
        let up = true;
        let out = ''
        for(let i=0; i<s.length; i++){
            if(up){
                out += s[i].toUpperCase();
                up = false;
            } else if(s[i]===' '){
                up = true;
                out += s[i]
            } else {out += s[i]}
        } return out
    }

    componentDidMount() {
        const hour_data = this.props.hourly.map(function(d) {
            return {
                date: new Date(d.dt * 1000),
                celsius: Math.round(d.temp-273.15),
                farenheit: Math.round((d.temp-273.15)*9/5+32),
                speed: d.wind_speed,
                deg: d.wind_deg,
                precip: d['pop']*100
            }
        })
        const day_data = this.props.daily.map(function(d) {
            return {
                date: new Date(d.dt*1000),
                celsius: {
                    high: Math.round(d.temp['day']-273.15),
                    low: Math.round(d.temp['night']-273.15)
                },
                farenheit: {
                    high: Math.round((d.temp['day']-273.15)*9/5+32),
                    low: Math.round((d.temp['night']-273.15)*9/5+32)
                },
                speed: d.wind_speed,
                deg: d.wind_deg,
                precip: d['pop']*100,
                condition: d.weather[0]['description']
            }
        })
        this.setState({
            hourly: hour_data,
            daily: day_data
        })
    }

    render(){
        const temp = this.state.celsius ? Math.round(this.props.current['temp']-273) : Math.round((this.props.current['temp']-273)*9/5+32)
        const feels = this.state.celsius ? Math.round(this.props.current['feels_like']-273) : Math.round((this.props.current['feels_like']-273)*9/5+32)
        let graph
        if (this.state.scope){
            graph = <HourGraph
                    hourly={this.state.hourly}
                    height={500}
                    width={1000}
                    celsius={this.state.celsius}
                    look={this.state.look}
                    />
        } else {
        if (this.state.look==='temp'){
            graph = <BarGraph
                    daily={this.state.daily}
                    hourly={this.state.hourly}
                    height={500}
                    width={1000}
                    celsius={this.state.celsius}
                    />
        } else if(this.state.look==='precip'){
            graph = <RainGraph
                    daily={this.state.daily}
                    hourly={this.state.hourly}
                    height={500}
                    width={1000}
                    />
        }}
        const scope = this.state.scope ? 'Hourly' : '8-Day'
        const deg = this.state.celsius ? ' (°C)' : ' (°F)'
        const type = this.state.look==='temp' ? 'Temperature Forecast'+deg : 'Precipitation (%)'
        const title = scope + ' ' + type
        return(
            <div>
                <h1>
                    {this.props.city}
                </h1>
                <button onClick={this.handleEdit}>| Edit</button>
                <table>
                    <caption>
                        Current Weather
                    </caption>
                    <tr>
                        <td>Temperature: </td>
                        <td>{temp}° {this.state.celsius ? 'C' : 'F'}</td>
                    </tr>
                    <tr>
                        <td>Feels Like: </td>
                        <td>{feels}° {this.state.celsius ? 'C' : 'F'}</td>
                    </tr>
                    <tr>
                        <td>Conditions: </td>
                        <td>{this.title(this.props.current['weather'][0]['description'])}</td>
                    </tr>
                </table>
                <br />
                <h2 style={{'text-align':'center','font-size':30}}>{title}</h2>
                <button onClick={this.handleClick} className={'graph-change'}>
                    {this.state.celsius ? 'Farenheit' : 'Celsius'}
                </button>
                <button onClick={this.handleScopeChange}>
                    {this.state.scope ? 'Daily Forecast' : 'Hourly Forecast'}
                </button>
                <button onClick={this.handleLookChange}
                        value={this.state.look==='precip' ? 'temp' : 'precip'}
                        >
                    {this.state.look==='precip' ? 'Temperature' : 'Precipitation'}
                </button>
                <br />
                {graph}
            </div>
        )
    }
}

class Welcomed extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: ''
        }
        this.handleZip = this.handleZip.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(e){
        this.setState({value: e.target.value})
    }

    handleZip(){
        this.props.onZipChange(this.state.value)
    }

    render(){
        return (
            <div style={{'position':'absolute','text-align':'center','top':'30%','left':'30%'}}>
                <h1>Welcome</h1>
                <h2>Please Enter your city and state / country code</h2>
                <form onSubmit={this.handleZip}>
                <input
                    type={'text'}
                    placeholder={'Chicago, Il'}
                    value={this.state.value}
                    onChange={this.handleChange}
                />
                <input type={'submit'} value={'Enter'} />
                </form>
            </div>
        )
    }
}

class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zip: '',
            lat: '',
            lon: '',
            coords: false,
            first: false,
            taken: false,
            second: false,
            current: {},
            hourly: [],
            daily: [],
            code: 100,
            start: false,
            city: ''
        }
        this.handleZip = this.handleZip.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
    }
    handleEdit(){
        this.setState({
            first: false,
            second: false,
            coords: false,
            taken: false,
            start: false
        })
    }

    handleZip(zipText) {
        let city = zipText.replace(',', '')
        city = city.replace(' ', '%20')
        this.setState({
            zip: city,
            start: true
        })
    }

    componentDidUpdate() {

    }

    getCoords() {
        const link = 'https://maps.googleapis.com/maps/api/geocode/json?address='
        const key = '<my Google API key>'
        const url = link + this.state.zip + key
        let obj;
        this.setState({coords: true})
        console.log('coords ran')
        fetch(url)
            .then(response => response.json())
            .then(data => obj = data)
            .then(() => {if(obj.status==='ZERO_RESULTS') {
                this.setState({code: 400})
                alert('This zip code is not found')
            }})
            .then(() => this.setState({
                lat: obj['results'][0]['geometry']['location']['lat'],
                lon: obj['results'][0]['geometry']['location']['lng'],
                first: true,
                city: obj['results'][0]['formatted_address']
            }))
    }

    getWeather() {
        const url1 = 'https://api.openweathermap.org/data/2.5/onecall?lat=';
        const lat = `${this.state.lat}`
        const lon = `${this.state.lon}`
        const url2 = '&lon='
        const url3 = '&exclude=minutely&appid='
        const api_key = '<my Open Weather Map key>'
        const url = url1 + lat + url2 + lon + url3 + api_key
        let obj;
        this.setState({taken: true})
        console.log('weather ran')
        fetch(url)
            .then(response => response.json())
            .then(data => obj = data)
            .then(() => this.setState({
                        code: (obj['cod'] === undefined) ? 200 : obj['cod'],
                        second: true,
                        current: obj['current'],
                        hourly: obj['hourly'],
                        daily: obj['daily']
                    })

            )
    }

    render() {
        if(this.state.start && !this.state.coords){
            this.getCoords()
        }
        if(this.state.first && !this.state.taken){
            this.getWeather()
        }
        if(!this.state.start){
        return (
            <Welcomed
                onZipChange={this.handleZip}
                zip={this.state.zip}
            />
        )} else if(this.state.code > 200){
            return (
                <div>
                    <h1>Sorry, That Zip Code doesn't seem to exist</h1>
                    <h2>Please go back and try again</h2>
                </div>
            )
        } else if(!this.state.second){
            return (
                <div>
                    <h1>Loading</h1>
                </div>
            )
        }
        else{
            return (
                <Now
                    current={this.state.current}
                    daily={this.state.daily}
                    hourly={this.state.hourly}
                    city={this.state.city}
                    onEditClick={this.handleEdit}
                />
            )
        }
    }
}





    export default Welcome
