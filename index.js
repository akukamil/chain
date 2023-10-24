var M_WIDTH=800, M_HEIGHT=450;
var app,chat_path,gdata={}, game_res, game, objects={}, LANG = 0, state="", game_tick = 0, game_id = 0, connected = 1, client_id =0, h_state = 0, game_platform = "",
hidden_state_start=0,fbs=null, pending_player='', opponent={}, my_data={opp_id : ''}, players_cache={BOT:{name:'Rebecca',pic_url:'123'}},
opp_data={}, some_process={},git_src='', ME=0,OPP=1,WIN=1,DRAW=0,LOSE=-1,NOSYNC=2,turn=0,BET=0,BIG_BLIND=2;

let room_id='room1';
const BANK_DATA=[0,5,10,20,50,100,500,1000,2000,3000,5000];
let QUESTIONS=null;

fbs_once=async function(path){	
	let info=await fbs.ref(path).once('value');
	return info.val();
}

irnd = function(min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(game_res.resources.lb_player_card_bcg.texture);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};
		this.bcg.width = 370;
		this.bcg.height = 70;

		this.place=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.place.tint=0xffff00;
		this.place.x=20;
		this.place.y=22;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=43;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.name.tint=0xdddddd;
		this.name.x=105;
		this.name.y=22;


		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating.x=350;
		this.rating.anchor.set(1,0);
		this.rating.tint=0xffaaff;
		this.rating.y=22;

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating);
	}


}

class chat_record_class extends PIXI.Container {
	
	constructor() {
		super();
		
		this.tm=0;
		this.hash=0;
		this.index=0;
		this.uid='';
			
		this.name = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: 27});
		this.name.x=0;
		this.name.y=0;	
		this.name.tint=0xffff00;
					
		this.msg = new PIXI.BitmapText('Имя Фамил', {fontName: 'mfont',fontSize: 27,align: 'left'}); 
		this.msg.x=0;
		this.msg.y=0;
		this.msg.maxWidth=600;
		this.msg.tint = 0xffffff;
				
		this.visible = false;
		this.addChild(this.msg,this.name);
		
	}	
	
	async set(msg_data) {									

		this.uid=msg_data.uid;
		this.tm = msg_data.tm;			
		this.hash = msg_data.hash;
		this.index = msg_data.index;
		
		//уменьшаем имя		
		const name=msg_data.name.substring(0, 7)
		this.name.text=name+': ';
		this.msg.text=this.name.text+msg_data.msg;		
		this.visible = true;		
	
		
	}		
	
	hide(){
		
		
		
	}
	
}

class player_card_class extends PIXI.Container {
		
	constructor(x,y) {
		
		super();
		
		this.stat=0;
		this.place=0;
		this.uid=0;				
				
		this.avatar_hl=new PIXI.Sprite(gres.avatar_hl.texture);
		this.avatar_hl.width=this.avatar_hl.height=100;
		this.avatar_hl.x=-10;
		this.avatar_hl.y=-10;		
		this.avatar_hl.visible=false;
		
		this.avatar_hl_vote=new PIXI.Sprite(gres.avatar_hl_red.texture);
		this.avatar_hl_vote.width=this.avatar_hl_vote.height=100;
		this.avatar_hl_vote.x=-10;
		this.avatar_hl_vote.y=-10;		
		this.avatar_hl_vote.visible=false;
				
		this.avatar_mask=new PIXI.Sprite(gres.avatar_mask.texture);
		this.avatar_mask.width=this.avatar_mask.height=80;
		this.avatar_mask.x=0;
		this.avatar_mask.y=0;
		
		this.avatar=new PIXI.Sprite();
		this.avatar.width=this.avatar.height=60;
		this.avatar.x=10;
		this.avatar.y=10;
		this.avatar.interactive=this.avatar.buttonMode=true;
		const t=this;
		this.avatar.pointerdown=function(){game.avatar_down(t)};
		
		this.avatar.mask=this.avatar_mask;
		
		this.avatar_frame=new PIXI.Sprite(gres.avatar_frame.texture);
		this.avatar_frame.width=this.avatar_frame.height=80;
		
		this.cross=new PIXI.Sprite(gres.cross_img.texture);
		this.cross.x=this.cross.y=40;
		this.cross.width=this.cross.height=80;
		this.cross.anchor.set(0.5,0.5);
		this.cross.visible=false;
		
		
		this.vote_bcg=new PIXI.Sprite(gres.vote_bcg.texture);
		this.vote_bcg.width=this.vote_bcg.height=60;
		this.vote_bcg.x=40;
		this.vote_bcg.y=-5;
		this.vote_bcg.visible=false;
		
		this.t_vote_res=new PIXI.BitmapText('0', {fontName: 'mfont', fontSize :30});
		this.t_vote_res.anchor.set(0.5,0.5);
		this.t_vote_res.x=70;
		this.t_vote_res.y=25;
		this.t_vote_res.tint=0x111111;
		this.t_vote_res.visible=false;
						
		this.name=new PIXI.BitmapText('Ирина Т.', {fontName: 'mfont', fontSize :22});
		this.name.anchor.set(0.5,0.5);
		this.name.x=40;
		this.name.y=80;
		this.name.tint=0xffffff;
						
		this.t_rating=new PIXI.BitmapText('9564', {fontName: 'mfont', fontSize :24});
		this.t_rating.x=40;
		this.t_rating.y=100;
		this.t_rating.tint=0xffffff;
		this.t_rating.anchor.set(0.5,0.5);
		
		this.active=0;
		this.place=-1;
		
		this.visible=false;
		
		this.addChild(this.avatar_hl,this.avatar_hl_vote,this.avatar_mask,this.avatar,this.avatar_frame,this.cross,this.vote_bcg,this.t_vote_res,this.name,this.t_rating);
		
	}	
	
	set_as_mine(mine){		
		if(mine){
			this.name.tint=0xffff00;
			this.t_rating.tint=0xffff00;
		}else{
			this.name.tint=0xffffff;
			this.t_rating.tint=0xffffff;
		}				
	}
		
	async show_income(income){	
		this.t_won.text='+'+income;
		anim2.add(this.t_won,{y:[this.t_won.sy-50,this.t_won.sy],alpha:[0,1]}, true, 0.25,'linear',false);
		await new Promise((resolve, reject) => {setTimeout(resolve, 8000);});
		anim2.add(this.t_won,{y:[this.t_won.y,this.t_won.sy-50],alpha:[1,0]}, false, 0.25,'linear',false);
	}
		
	set_uid(uid){
		
		
		
	}
	
	set_on_turn(on){
		
		if(on){
			this.run_timer();
			this.bcg.texture=gres.id_card_play_bcg.texture			
		}else{			
			this.bcg.texture=gres.id_card_bcg.texture			
		}	
	}
	

}

class bank_point_class extends PIXI.Container {
	
	constructor(){
		
		super();
		
		this.bcg=new PIXI.Sprite(gres.bank_point_bcg.texture);
		this.bcg.width=80;
		this.bcg.height=50;
		
		this.t_money=new PIXI.BitmapText('1000', {fontName: 'mfont', fontSize :25});
		this.t_money.anchor.set(0.5,0.5);
		this.t_money.x=40;
		this.t_money.y=25;
		
		this.addChild(this.bcg, this.t_money);
		
	}
	
	
}

chat={
	
	bottom:0,
	cont_total_shift:0,
	activated:0,
		
	activate() {		

		if(!this.activated){
			this.init();
			this.activated=1;
		}
		anim2.add(objects.chat_cont,{alpha:[0, 0.6]}, true, 0.1,'linear');

	},
	
	close() {
		
		anim2.add(objects.chat_cont,{alpha:[0.6, 0]}, false, 0.1,'linear');

	},
	
	init(){
		
		
		this.last_record_end = 0;
		objects.chat_cont.x=10;	
		objects.chat_cont.y=440;	
		objects.chat_cont.visible=true;
		
		for(let rec of objects.chat_records) {
			rec.visible = false;			
			rec.msg_id = -1;	
			rec.tm=0;
		}		
		
		//загружаем чат
		fbs.ref('chat').orderByChild('tm').limitToLast(20).once('value', snapshot => {chat.chat_load(snapshot.val());});		
		
	},	
	
	async chat_load(data) {
		
		if (data === null) return;
		
		//превращаем в массив
		data = Object.keys(data).map((key) => data[key]);
		
		//сортируем сообщения от старых к новым
		data.sort(function(a, b) {	return a.tm - b.tm;});
			
		//покаываем несколько последних сообщений
		for (let c of data)
			await this.chat_updated(c,true);	
		
		//подписываемся на новые сообщения
		fbs.ref('chat').on('child_changed', snapshot => {chat.chat_updated(snapshot.val());});
	},	
				
	async chat_updated(data, first_load) {		
	
		//console.log('receive message',data)
		if(data===undefined) return;
		
		//если это сообщение уже есть в чате
		if (objects.chat_records.find(obj => { return obj.hash === data.hash;}) !== undefined) return;
		
		
		//выбираем номер сообщения
		const new_rec=objects.chat_records[data.index||0]
		await new_rec.set(data);
		new_rec.y=this.last_record_end;
		
		const inter_line_space=22;
		
		this.last_record_end+=inter_line_space;		
		
		//смещаем на одно сообщение (если чат не видим то без твина)
		if (objects.chat_cont.visible)
			await anim2.add(objects.chat_cont,{y:[objects.chat_cont.y,objects.chat_cont.y-inter_line_space]},true, 0.05,'linear');		
		else
			objects.chat_cont.y-=inter_line_space;
		
	},
			
	make_hash() {
	  let hash = '';
	  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  for (let i = 0; i < 6; i++) {
		hash += characters.charAt(Math.floor(Math.random() * characters.length));
	  }
	  return hash;
	},
	
	get_oldest_index () {
		
		let oldest = {tm:9671801786406 ,visible:true};		
		for(let rec of objects.chat_records)
			if (rec.tm < oldest.tm)
				oldest = rec;	
		return oldest.index;		
		
	},
	
	send(t){

		if(t.length<2) return;
		const hash=this.make_hash();
		const index=this.get_oldest_index();
		fbs.ref('chat/'+index).set({uid:my_data.uid,name:my_data.name,msg:t,tm:firebase.database.ServerValue.TIMESTAMP,index, hash});
		
	},
	
	get_old_message(){
		
		const res=objects.messages.find(msg => msg.visible===false);
		if(res) return res;
		
		return objects.messages.reduce((oldest, msg) => {
			return oldest.y < msg.y ? oldest : msg;
		});		
	}
		
}

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0, visible:false, ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
		
	
	any_on() {		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;			
	},
	
	linear(x) {
		return x
	},
	
	kill_anim(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj){
					this.slot[i].p_resolve('finished');		
					this.slot[i].obj.ready=true;					
					this.slot[i]=null;	
				}
	
	},
	
	flick(x){
		
		return Math.abs(Math.sin(x*6.5*3.141593));
		
	},
	
	easeBridge(x){
		
		if(x<0.1)
			return x*10;
		if(x>0.9)
			return (1-x)*10;
		return 1		
	},
	
	easeOutBack(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutBack2(x) {
		return -5.875*Math.pow(x, 2)+6.875*x;
	},
	
	easeOutElastic(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad(x) {
		return x * x;
	},
	
	easeOutBounce(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic(x) {
		return x * x * x;
	},
	
	ease2back(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake(x) {
		
		return Math.sin(x*2 * Math.PI);	
		
	},	
	
	add (obj, params, vis_on_end, time, func, block=true) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {
				
				obj.visible = true;
				obj.ready = false;

				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back' || func === 'shake')
					for (let key in params)
						params[key][1]=params[key][0];				
					
				this.slot[i] = {
					obj,
					block,
					params,
					vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

		
		

	},	
		
	process() {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;		
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
									
					s.obj.visible=s.vis_on_end;
					if (s.vis_on_end === false)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	},
	
	async wait(time) {
		
		await this.add(this.empty_spr,{x:[0, 1]}, false, time,'linear');	
		
	}
}

sound = {
	
	on : 1,
	
	play : function(snd_res) {
				
		if (!gres[snd_res]?.sound)
			return;
		
		if (this.on === 0)
			return;		

		
		gres[snd_res].sound.play();	
		
	},
	
	play_delayed (snd_res, delay) {
		
		if (this.on === 0)
			return;
		
		if (gres[snd_res]===undefined)
			return;
		
		
		setTimeout(function(){game_res.resources[snd_res].sound.play()}, delay);
			
		
	},
	
	stop_all(){
		
		PIXI.sound.stopAll();
	}
		
}

music={
	
	on:1,
	
	activate(){
		
		if (!this.on) return;
	
		if (!gres.music.sound.isPlaying){
			gres.music.sound.play();
			gres.music.sound.loop=true;
		}
	},
	
	switch(turn_off){
		
		if (turn_off||this.on){
			this.on=0;
			PIXI.sound.stopAll();
			gres.music.sound.stop();			
		} else{
			this.on=1;
			gres.music.sound.play();	
		}
		
		objects.music_switch_button.texture=gres[['no_music_icon','music_switch_button'][this.on]].texture;
	}
	
}

host={
	
	bank_resolver:0,
	
	async add_msg(header_text, msg, bank,snd){
						
		//если уже есть какой-то промис то закрываем его
		if (this.bank_resolver) this.bank_resolver('forced');
		
		sound.play(snd||'host_message');
		
		if (bank){	
			objects.t_host_msg.text='';
			await anim2.add(objects.host_bank_ask,{scale_x:[0,0.666]}, true, 0.25,'easeOutBack');	
			const res=await new Promise(resolve=>{				
				host.bank_resolver=resolve;
			})			
			if(res==='forced') return;
			
			anim2.add(objects.host_bank_ask,{scale_x:[0.666,0]}, false, 0.25,'linear');	
		}else{			
			objects.host_bank_ask.visible=false;			
		}
	
		objects.host_msg.visible=true;
		await anim2.add(objects.t_host_msg,{scale_y:[1,0]}, true, 0.25,'linear');	
		objects.t_host_msg_header.text=header_text;
		objects.t_host_msg.text=msg;
		anim2.add(objects.t_host_msg,{scale_y:[0,1]}, true, 0.25,'linear');		
		
	}
	
}

test_game={
	
	cor_ans:'241514124',
	on:0,
	bank_level:0,
	
	activate(){
		
		this.bank_level=0;
		this.on=1;
		this.start();
		
		//если это просмотр и банк скрыт то показываем его
		if (!objects.bank_cont.visible)
			anim2.add(objects.bank_cont,{x:[-100,0]}, true, 1,'easeOutBack');
		
		
		objects.t_time_to_single_game.visible=false;
		//устанавливаем банк на начало
		game.set_bank_level(0);		
		
	},
	
	start(){
		
		const q_id=irnd(0,QUESTIONS.length-1);
		this.cor_ans=QUESTIONS[q_id][0];
		host.add_msg('ТЕСТ',QUESTIONS[q_id][1])
		
		keyboard.kill();
		keyboard.show();
		keyboard.callback=this.ans.bind(test_game);
		
	},
	
	stop(){
		
		this.on=0;
	},
	
	ans(t){	
		
		if (t!==this.cor_ans){
			anim2.add(objects.keyboard,{x:[objects.keyboard.x, objects.keyboard.x+10]}, true, 0.15,'shake');			
			sound.play('wrong_ans');
			this.bank_level=0;
			game.set_bank_level(0,0);
		}else{
			sound.play('correct_ans')
			this.start();		
			this.bank_level++;
			if(this.bank_level>=BANK_DATA.length)
				this.bank_level=0;
			game.set_bank_level(this.bank_level,0);
		}
		
		if (t==='ПАС'){
			const q_id=irnd(0,QUESTIONS.length-1);
			this.cor_ans=QUESTIONS[q_id][0];
			host.add_msg('ТЕСТ',QUESTIONS[q_id][1])
			this.bank_level=0;
			game.set_bank_level(0,0);
		}

		console.log(t);		
	}	
	
}

game={
	
	my_cards:[],
	players:[],
	uid_to_pcards:{},
	iam_active:0,
	first_event:1,
	pending_timer:0,
	my_card:null,
	recent_msg:[],
	voting_on:0,
	num_of_questions:0,
	cur_question:0,
	first_letter_bonus:0,
	num_of_letters_bonus:0,
	wait_players_start:0,
		
	async activate(){
		
		//текущее состояние стола
		await game.analyse_table();		

		//показываем аватарки
		objects.avatars_cont.visible=true;	
				
		//показываем кнопки но без чата
		objects.exit_button.pointerdown=function(){game.exit_down()};
		objects.chat_button.visible=false;
		objects.control_buttons.y=190;
		anim2.add(objects.control_buttons,{x:[800,objects.control_buttons.sx]}, true, 0.24,'linear');	
									
		//keep-alive для стола		
		fbs.ref(room_id+'/pending/'+my_data.uid).set({rating:my_data.rating,tm:firebase.database.ServerValue.TIMESTAMP});
		this.pending_timer=setInterval(function(){
			if(!document.hidden)
				fbs.ref(room_id+'/pending/'+my_data.uid).set({rating:my_data.rating,tm:firebase.database.ServerValue.TIMESTAMP});
		},10000)
							
		//процессинг таймера ходов
		some_process.timer_bar=this.process.bind(this);			
			
		fbs.ref(room_id+'/pending/'+my_data.uid).onDisconnect().remove();
				
		//подписываемся на серверные сообщения
		fbs.ref(room_id+'/server_events').on('value',function(s){
			
			if (game.first_event){
				game.first_event=0;
				return;
			}
			
			const data=s.val();
		
			if(data.type==='game_init')
				game.game_start_event(data);			
			
			if(data.type==='new_round')
				game.new_round_event(data);
			
			if(data.type==='put_bank')
				game.put_bank(data);	
					
			if(data.type==='no_players')
				game.no_players_event();	
					
			if(data.type==='q')
				game.game_question_event(data);	
			
			if(data.type==='out')
				console.log('убрали игрока',data.uid)
			
			if(data.type==='fans')
				game.super_game_ans(data);	
			
			if(data.type==='r_fin')
				game.round_finish_event(data);	
			
			if(data.type==='voting')
				game.start_voting(data);	
			
			if(data.type==='voting_res')
				game.show_voting_res(data);	
			
			if(data.type==='ans')
				game.game_ans(data);	
			
			if(data.type==='super_game')
				game.super_game_start_event(data);		
			
			if(data.type==='super_game2')
				game.super_game2_start_event(data);	
		});
				
	},
	
	async game_start_event(data){
		
		//расставляем иконки
		for(let i=0;i<objects.pcards.length;i++){
			const card=objects.pcards[i];
			card.x=110+i*82;
		}

		this.players=data.players;	

		//закрываем если открыта
		if (objects.keyboard_cont.visible)
			keyboard.close();
		
		//останавливаем тестовую игру
		test_game.stop();

		//скрываем данные от суперигры
		objects.ans_icons_cont.visible=false;
						
		objects.timer_bar.visible=false;
				
		//отключаем проверку количества игроков
		fbs.ref(room_id+'/pending').off();
				
		//Убираем окно статуса
		this.close_status_window();			
		
		//загружаем игроков
		await this.init_active_players(this.players);
				
		//текущий банк
		objects.t_total_bank.text=0;			
	
		anim2.add(objects.host_msg,{scale_x:[0,1]}, true, 0.24,'linear');	
		
		if (this.players.length===1)
			host.add_msg('ИНФО','ПОКА НЕТ ДРУГИХ ИГРОКОВ, ПРОВЕРИМ ВАШИ ЗНАНИЯ, ВАС ЖДУТ 3 ВОПРОСА!')
		else
			host.add_msg('ИНФО','НАЧИНАЕМ ИГРУ!')			
		
		//подчищаем карточки игроков
		this.clean_cards();
		
		//определяем меня
		this.my_card=this.uid_to_pcards[my_data.uid];
		if (!this.my_card) return;
				
		this.iam_active=1;
					
	},
		
	new_round_event(data){
		
		this.num_of_questions=data.q_cnt;
		this.cur_question=1;
		
		if (this.players.length===1)
			host.add_msg('ИНФО','НАЧИНАЕМ...')
		else
			host.add_msg('ИНФО','НАЧИНАЕМ НОВЫЙ РАУНД!')
				
		//показываем контейнер с банком
		anim2.add(objects.bank_cont,{x:[-100,0]}, true, 1,'easeOutBack');	
		
		objects.timer_bar.visible=false;
		
		//устанавливаем банк на начало
		this.set_bank_level(0);
		
		//подчищаем карточки
		this.clean_cards();
		
	},

	async game_question_event(data){						
						
		const is_bank=this.players.length>1&&data.put_bank&&data.uid===my_data.uid;
		const q=this.cur_question+'/'+this.num_of_questions;
		this.cur_question++;
		host.add_msg('ВОПРОС '+q,QUESTIONS[data.q_id][1],is_bank)
									
		//убираем все хайлайты кроме того кого спрашивают
		for (const [uid, card] of Object.entries(this.uid_to_pcards)){
			if (uid===data.uid){
				card.avatar_hl.visible=true;
				card.alpha=1;			
			}else{
				card.avatar_hl.visible=false;					
				card.alpha=0.5;	
			}	
		}
				
		this.start_timer(20);
		
		//если это вопрос не мне или я не в игре
		if(data.uid!==my_data.uid||!this.iam_active) return		
				
		//подсказка
		this.show_hint(QUESTIONS[data.q_id][0]);		
		
		let ans_data = await keyboard.open();
		if (ans_data==='KILL') return;
		keyboard.close();
		fbs.ref(room_id+'/players_actions').set({uid:my_data.uid,type:'ans',ans:ans_data,tm:Date.now()})
		
	},
			
	show_hint(correct_ans){
		
		const first_letter=correct_ans[0];
		const num_of_letters=correct_ans.length;
		let hint_text='';	

		if (this.num_of_letters_bonus)
			hint_text+='Букв - '+num_of_letters;
		if (this.first_letter_bonus)
			hint_text+='   Первая - '+first_letter;
			
		objects.t_hint.text=hint_text;
		anim2.add(objects.t_hint,{alpha:[0,0.75]}, false, 9,'easeBridge',false);			
	},
		
	game_ans(data){
		
		//отображаем ответ
		this.show_ans(data);	
				
		//если это просмотр и банк скрыт то показываем его
		if (!objects.bank_cont.visible)
			anim2.add(objects.bank_cont,{x:[-100,0]}, true, 1,'easeOutBack');
		
		//выключаем если нет ответа
		if (!data.ans){
			
			const card=this.uid_to_pcards[data.uid];
			card.active=0;
			anim2.add(card.cross,{scale_xy:[0,0.666]}, true, 0.8,'easeOutBack');
			card.alpha=0.25;
			
			if (card.uid===my_data.uid) this.iam_active=0;
			
			//если больше нет игроков (они куда-то делись)
			if (this.count_active_players()<2){	
				host.add_msg('ИНФО','КРОМЕ ВАС НИКОГО НЕТ...');
				this.show_status_window('Ждем игроков...');
				
				//добавляем	 банк у игроку
				this.take_bank();
			}			
			
			return;
		}
				
		
		this.set_bank_level(data.b_level,data.b_total);
		console.log(data);	
	},
	
	no_players_event(){
		
		//закрываем если открыта
		if (objects.keyboard_cont.visible)
			keyboard.close();
		
		host.add_msg('ИНФО','ВСЕ ИГРОКИ ПОКИНУЛИ ИГРУ...')
		
		this.show_status_window('Ждем игроков...');
	},
	
	round_finish_event(data){	
		if (data.single)
			host.add_msg('ИНФО','НЕПЛОХО! ИГРАЙТЕ С ДРУГИМИ ИГРОКАМИ С ГОЛОСОВАНИЕМ И СУПЕР ИГРОЙ');	
		else
			host.add_msg('ИНФО','РАУНД ЗАКОНЧЕН, ЗАРАБОТАНО ДЕНЕГ: '+objects.t_total_bank.text+'\nПРОДОЛЖИМ ПОСЛЕ РЕКЛАМЫ...');	
		ad.show();
	},
	
	take_bank(won_bank){
		
		let total_bank=+objects.t_total_bank.text;
		if (!total_bank) return;
		if (won_bank) total_bank=won_bank;
		my_data.rating+=total_bank
		fbs.ref('players/'+my_data.uid+'/rating').set(my_data.rating);
		
	},
					
	clean_cards(){
		
		//убираем что могло остаться от старых игр
		for (const [uid, card] of Object.entries(this.uid_to_pcards)){		
			card.avatar_hl.visible=false;
			card.avatar_hl_vote.visible=false;
			card.t_vote_res.visible=false;
			card.vote_bcg.visible=false;
			if (card.active){
				card.cross.visible=false;
				card.alpha=1;				
			}else{
				card.cross.visible=true;
				card.alpha=0.5;	
			}
		}		
	},
			
	start_voting(data){
		
		this.voting_on=1;

		host.add_msg('ИНФО','НАЧИНАЕМ ГОЛОСОВАНИЕ! НАЖМИТЕ НА АВАТАР ИГРОКА КОТОРОГО ВЫ СЧИТАЕТЕ САМЫМ СЛАБЫМ',0,'voting');
		this.start_timer(20);
		
		//чистим карточки
		this.clean_cards();
		
	},
	
	avatar_down(card){
		
		if(card.uid===my_data.uid) return;
		if(card.active===0) return;
		if(!this.voting_on) return;
				
		host.add_msg('ИНФО','ВЫБОР СДЕЛАН! ЖДЕМ ОСТАЛЬНЫХ ИГРОКОВ...',0,'vote_done');
		
		card.avatar_hl_vote.visible=true;		
		fbs.ref(room_id+'/votes/'+my_data.uid).set(card.uid);
		
		this.voting_on=0;
		
	},
	
	show_voting_res(data){
		
		//показываем всем нули
		for (const [uid, card] of Object.entries(this.uid_to_pcards)){			
			card.t_vote_res.text='0';
			card.t_vote_res.visible=true;
			card.vote_bcg.visible=true;
		}
				
		//показываем результаты
		for (let uid in data.votes_stat){			
			const votes=data.votes_stat[uid];
			const card=this.uid_to_pcards[uid];
			card.avatar_hl_vote.visible=false;
			card.avatar_hl.visible=false;
			card.t_vote_res.text=votes;
		}		
		
		//фиксируем слабое звено
		const weakest_card=this.uid_to_pcards[data.weakest_link];		
		weakest_card.active=0;
		anim2.add(weakest_card.cross,{scale_xy:[0,0.666]}, true, 0.8,'easeOutBack');
		if(weakest_card.uid===my_data.uid){
			this.iam_active=0;
			host.add_msg('ИНФО','ВЫ САМОЕ СЛАБОЕ ЗВЕНО! ПРОЩАЙТЕ!',0,'lose');
		}else{
			
			host.add_msg('ИНФО',weakest_card.name.text+' САМОЕ СЛАБОЕ ЗВЕНО!');			
		}
		
		//показываем сообщение
		
		
		
	},
			
	set_bank_level(bank_level,bank_total){
		
		if (bank_total)
			objects.t_total_bank.text=bank_total;
		
		objects.bank_points.forEach(p=>p.bcg.texture=gres.bank_point_bcg.texture)		
		objects.bank_points[bank_level].bcg.texture=gres.cur_bank_point_bcg.texture;
		
	},
	
	super_game_start_event(){
		
		this.num_of_questions=10;
		this.cur_question=1;
		
		//показываем сообщение
		host.add_msg('ИНФО','НАЧИНАЕМ СУПЕР ИГРУ!',0,'super_game');
				
		//убираем банк
		if (objects.bank_cont.visible)
			anim2.add(objects.bank_cont,{x:[0,-100]}, true, 0.5,'linear');		
		
		//скрываем игроков которые вне игры
		for (const [uid, card] of Object.entries(this.uid_to_pcards))
			if (!card.active) card.visible=false;

		//определяем оставшихся 2-х игроков
		const sg_cards=Object.values(this.uid_to_pcards).filter(card=>card.active);
		if (sg_cards.length!==2){
			alert('Неправильное количество игроков в суперигре(((');
			return;
		}
		
		//конвертор UID в иконки
		this.uid_to_icons={};
		this.uid_to_icons[sg_cards[0].uid]=objects.ans_icons1;
		this.uid_to_icons[sg_cards[1].uid]=objects.ans_icons2;
		
		//показываем контейнер но иконки пока скрываем
		objects.ans_icons_cont.visible=true;
		[...objects.ans_icons1,...objects.ans_icons2].forEach(i=>i.visible=false);
		
		anim2.add(sg_cards[0],{x:[sg_cards[0].x,40]}, true, 0.5,'easeOutBack');		
		anim2.add(sg_cards[1],{x:[sg_cards[1].x,390]}, true, 0.5,'easeOutBack');
		
	},
	
	super_game2_start_event(){
		
		this.num_of_questions=10;
		this.cur_question=1;
		
		//показываем сообщение
		host.add_msg('ИНФО','ПОКА НИЧЬЯ! ЕЩЕ 5 ВОПРОСОВ ПОКА КТО-НИБУДЬ НЕ ОШИБЕТСЯ ИЛИ НИЧЬЯ');
		
	},
	
	super_game_ans(data){
		
		//отображаем ответ
		this.show_ans(data);	
		
		//показываем иконки
		const stat=data.stat;
		const icons=this.uid_to_icons[data.uid];
		
		for (let i=0;i<stat.length;i++){
			const icon=icons[i];
			icon.visible=true;
			if (+stat[i])
				icon.texture=gres.sg_correct_img.texture;
			else
				icon.texture=gres.sg_wrong_img.texture;				
		}		
						
		//если есть победитель
		if(data.winner){
			
			const total_bank=+objects.t_total_bank.text;
			
			//если ничья
			if (data.winner===-1){		
				const won_bank=~~(total_bank*0.5);
				this.take_bank(won_bank);
				host.add_msg('ИНФО','НИЧЬЯ! ВАШ ВЫИГРЫШ: '+won_bank);
			}else{
				
				if (data.winner===my_data.uid){		
					this.take_bank(total_bank);
					host.add_msg('ИНФО','ПОЗДРАВЛЯЮ С ПОБЕДОЙ! ВАШ ВЫИГРЫШ: '+total_bank,0,'applause');
				}else{
					const winner_name=this.uid_to_pcards[data.winner].name.text;
					host.add_msg('ИНФО','ИГРА ЗАВЕРШЕНА! ПОБЕДИЛ '+winner_name);
				}					
			}	
			
			
			this.show_status_window('Ждем игроков...');
		}	
		
	},
	
	show_ans(data){
		
		if (objects.keyboard_cont.visible)
			objects.keyboard_cont.visible=false;
		
		objects.timer_bar.visible=false;
		
		const card=this.uid_to_pcards[data.uid];
		
		objects.t_player_ans.text=data.ans;
		if (data.cor){
			objects.player_ans_bcg.texture=gres.correct_bcg.texture;			
			sound.play('correct_ans')
		}else{
			objects.player_ans_bcg.texture=gres.wrong_bcg.texture;					
			sound.play('wrong_ans')
		}		
			
		//показываем ответ
		objects.player_ans_cont.x=card.x+35;		
		anim2.add(objects.player_ans_cont,{alpha:[0,1]}, false, 4,'easeBridge',false);
	},
	
	show_status_window(t){
		
		objects.t_table_status0.text=t||'...';
		this.wait_players_start=Date.now();
		
		//сразу сколько игроков есть в pending
		fbs.ref(room_id+'/pending').on('value',data=>{
			game.show_pending_players(data.val());	
		})
		
		if (objects.bank_cont.visible)
			anim2.add(objects.bank_cont,{x:[0,-100]}, true, 0.5,'linear');	
				
		if (t==='Ждем игроков...')
			objects.t_time_to_single_game.visible=true;
				
		//показываем окошко статуса
		anim2.add(objects.table_status_cont,{y:[-150,objects.table_status_cont.sy]}, true, 0.2,'linear');	
	},
		
	close_status_window(){
		
		//сразу сколько игроков есть в pending
		fbs.ref(room_id+'/pending').off();
		
		objects.t_time_to_single_game.visible=false;
		
		//показываем окошко статуса
		anim2.add(objects.table_status_cont,{y:[objects.table_status_cont.y,-150]}, false, 0.2,'linear');		
	},
		
	show_pending_players(players){
		
		if(!players) return;
		
		const num_of_players=Object.keys(players).length;
		objects.t_table_status1.text=['Игроков онлайн: ','Players online: '][LANG]+num_of_players;
	},
		
	sound_switch_down(on){
					
		if (on)
			sound.on=on
		else
			sound.on=1-sound.on;
		
		objects.pref_sound_button.texture=gres[['no_sound_icon','sound_switch_button'][sound.on]].texture;
		
		sound.play('click');
	},
	
	music_switch_down(){
		
		music.switch();
		
	},
		
	exit_down(){
		
		if(anim2.any_on())return;
		this.close();
		main_menu.activate();
		
	},
	
	async analyse_table(){	

		const info=await fbs_once(room_id+'/info');

		if (info.state==='no_game'){
			this.show_status_window('Ждем игроков...');
			return;
		}
		
		this.show_status_window('Идет игра. Ждите завершения игры...');
				
		players=info.players.map(uid=>({uid}));			
		await this.init_active_players(players);			
		
		if (info.state==='round'){}
		
		if (info.state==='voting'){}
		
		if (info.state==='super_game')
			this.super_game_start_event();
	},
	
	async init_active_players(players){
		
		if(!players) return;
		
		//сначала убираем все карточки
		objects.pcards.forEach(c=>{c.visible=false;c.uid='xxx'});
		
		this.uid_to_pcards={};
		
		//сразу заполняем карточки айдишками игроков
		let i=0;
		for (let player of players){
			const pcard=objects.pcards[i];
			pcard.uid=player.uid;	
			pcard.visible=true;
			pcard.active=1;
			pcard.set_as_mine(pcard.uid===my_data.uid);			
			this.uid_to_pcards[player.uid]=pcard;
			i++;
		}

		//теперь другие данные которые нужно загружать
		for (let uid in this.uid_to_pcards){			
			await this.update_players_cache_data(uid);	
			const pcard=this.uid_to_pcards[uid];
			pcard.name.text=players_cache[uid].name.substring(0, 10);
			this.load_avatar({uid,tar_obj:pcard.avatar})
		}
			
		//обновляем деньги
		for (let uid in this.uid_to_pcards){
			const rating=await fbs_once('players/'+uid+'/rating');
			this.uid_to_pcards[uid].t_rating.text=rating||0;
			this.uid_to_pcards[uid].rating=rating||0;
		}
	},
			
	async update_players_cache_data(uid){
		if (players_cache[uid]){
			if (!players_cache[uid].name){				
				const name=await fbs_once('players/' + uid + '/name')||'***';
				players_cache[uid].name=name;
			}
							
			if (!players_cache[uid].pic_url){				
				const pic_url=await fbs_once('players/' + uid + '/pic_url');
				players_cache[uid].pic_url=pic_url||null;
			}
			
		}else{
			
			players_cache[uid]={};
			const t=await fbs_once('players/' + uid);
			players_cache[uid].name=t.name||'***';
			players_cache[uid].pic_url=t.pic_url||'';
		}		
	},
	
	async get_texture(pic_url) {
		
		if (!pic_url) PIXI.Texture.WHITE;
		
		//меняем адрес который невозможно загрузить
		if (pic_url==="https://vk.com/images/camera_100.png")
			pic_url = "https://i.ibb.co/fpZ8tg2/vk.jpg";	
				
		if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {
					
			let loader=new PIXI.Loader();
			loader.add('pic', pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});			
			await new Promise((resolve, reject)=> loader.load(resolve))	
			return loader.resources.pic.texture||PIXI.Texture.WHITE;

		}		
		
		return PIXI.utils.TextureCache[pic_url];		
	},
		
	async load_avatar (params = {uid:0,tar_obj:0}) {	
		const pic_url=players_cache[params.uid].pic_url;
		const t=await this.get_texture(pic_url);
		params.tar_obj.texture=t;			
	},
				
	start_timer(timeout){
		
		objects.timer_bar.tm=Date.now();
		objects.timer_bar.visible=true;
		objects.timer_bar.scale_x=1;
		objects.timer_bar.timeout=timeout;
		
	},
		
	process(){
		
		if (objects.timer_bar.visible){
			const time_left=objects.timer_bar.timeout-(Date.now()-objects.timer_bar.tm)*0.001;
			objects.timer_bar.scale_x=time_left/objects.timer_bar.timeout;				
			if (objects.timer_bar.scale_x<=0){
				objects.timer_bar.scale_x=0;
				objects.timer_bar.visible=false;
				this.timeout=0;				
			}			
		}
		
		if (objects.table_status_cont.visible&&objects.table_status_cont.ready){
			
			objects.table_status_circle.rotation+=0.2;				
			objects.table_status_pic.scale_y=Math.sin(game_tick)*0.666;
			
			if(!test_game.on&&objects.t_table_status0.text==='Ждем игроков...'){
				const wait_players_time=Date.now()-this.wait_players_start;
				const time_to_single_game=15-(~~(wait_players_time*0.001));
				objects.t_time_to_single_game.text='До одиночной игры осталось '+time_to_single_game+' секунд';
				if (time_to_single_game<=0)
					test_game.activate();
			}

		}
	
		//периодически покачиваем голову ведущей
		let x=((game_tick*3) % 16)-8;
		const x2=x*x;		
		objects.host_img.angle=10*(1-x2)*Math.exp(-0.5*x2);	
		
	},
	
	count_active_players(){
		
		return Object.values(this.uid_to_pcards).filter(card=>card.active).length;		
		
	},
	
	status_exit_down(){
		
		if(anim2.any_on())return;
		
		this.close();
		main_menu.activate();
		
	},
	
	sound_switch_down(val){		
		
		if (val!==undefined)
			sound.on=val
		else
			sound.on=1-sound.on
		
		sound.play('click')
		
		if (sound.on)
			objects.sound_switch_button.texture=gres.sound_switch_button.texture;
		else
			objects.sound_switch_button.texture=gres.no_sound_icon.texture;
		
	},
	
	put_bank(data){
		objects.t_total_bank.text=data.bank_total;
		sound.play('money');
		this.set_bank_level(0);
	},
		
	bank_opt_res(do_bank){
		
		//если кликнули на банк
		if (do_bank)
			fbs.ref(room_id+'/players_actions').set({uid:my_data.uid,type:'put_bank',tm:Date.now()})
		
		//завершаем
		host.bank_resolver('ok');		
	},
		
	bank_opt_down(e){
		
		sound.play('click');
		
		//координаты нажатия в плостоки спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.host_bank_ask.x;
		
		this.bank_opt_res(mx<0)
	
	},

	close(){
		
		game.first_event=1;		
		this.iam_active=0;
		this.close_status_window();
		objects.control_buttons.visible=false;	
		objects.host_msg.visible=false;
		objects.ans_icons_cont.visible=false;
		objects.bank_cont.visible=false;
		objects.avatars_cont.visible=false;
		objects.keyboard_cont.visible=false;		
		objects.timer_bar.visible=false;
		
		test_game.stop();
		
		clearInterval(this.pending_timer);
		fbs.ref(room_id+'/server_events').off();
		fbs.ref(room_id+'/pending/'+my_data.uid).remove();
		fbs.ref(room_id+'/pending').off();
	}
		
}

timer = {
	
	id : 0,
	time_left : 0,
	disconnect_time : 0,
	
	start : function(player, t) {
		
		this.clear();
		this.disconnect_time = 0;
		this.time_left = 30 || t;
		this.id = setTimeout(timer.check.bind(timer),1000);
		objects.timer_cont.visible = true;
		objects.timer_text.text = this.time_left;
		
		if (player === ME)
			objects.timer_cont.y = 305;
		else
			objects.timer_cont.y = 145;
		
		anim2.add(objects.timer_cont,{scale_x:[0, 1]}, true, 0.2,'linear');	
				
	},
	
	stop : function() {
			
		anim2.add(objects.timer_cont,{scale_x:[1, 0]}, false, 0.2,'linear');	
		this.clear();
		
	},
	
	clear : function() {

		clearTimeout(this.id);
		
	},
	
	check : function() {
		
		this.time_left--;
		
		if (turn === ME && this.time_left === 0)
			bet_dialog.no_time();
		
		if (turn === OPP && this.time_left === -5)
			bet_making.no_time();
		
		if (this.time_left === 5)
			sound.play('clock');
		
		if (connected === 0) {
			
			this.disconnect_time++;		
			if (this.disconnect_time > 5) {
				bet_dialog.no_connection();
				bet_making.no_connection();				
			}			
		}

		
		objects.timer_text.text = this.time_left;
		this.id = setTimeout(timer.check.bind(timer),1000);		
		
	},
	
	reset : function() {
		
				
		
	}
	
}

make_text = function (obj, text, max_width) {

	let sum_v=0;
	let f_size=obj.fontSize;

	for (let i=0;i<text.length;i++) {

		let code_id=text.charCodeAt(i);
		let char_obj=game_res.resources.m2_font.bitmapFont.chars[code_id];
		if (char_obj===undefined) {
			char_obj=game_res.resources.m2_font.bitmapFont.chars[83];
			text = text.substring(0, i) + 'S' + text.substring(i + 1);
		}

		sum_v+=char_obj.xAdvance*f_size/64;
		if (sum_v>max_width) {
			obj.text =  text.substring(0,i-1);
			return;
		}
	}

	obj.text =  text;
}

social_dialog = {
	

	invite_down : function() {
				
		gres.click.sound.play();
		vkBridge.send('VKWebAppShowInviteBox');		
		
	},
	
	share_down: function() {
		
		
		gres.click.sound.play();
		vkBridge.send('VKWebAppShowWallPostBox', {"message": `Помог пчелке защитить улей, теперь мой рейтинг ${my_data.rating}. Сможешь победить меня?`,
		"attachments": "https://vk.com/app8220670"});

	}
	
}

ad = {
	
	prv_show : -9999,
		
	show : function() {
		
		/*if ((Date.now() - this.prv_show) < 100000 )
			return;
		this.prv_show = Date.now();*/
		
		if (game_platform==='YANDEX') {			
			//показываем рекламу
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: function() {}, 
				onError: function() {}
						}
			})
		}
		
		if (game_platform==='VK') {
					 
			vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
			.then(data => console.log(data.result))
			.catch(error => console.log(error));	
		}			
		
		if (game_platform==='CRAZYGAMES') {				
			try {
				const crazysdk = window.CrazyGames.CrazySDK.getInstance();
				crazysdk.init();
				crazysdk.requestAd('midgame');		
			} catch (e) {			
				console.error(e);
			}	
		}	
		
		if (game_platform==='GM') {
			sdk.showBanner();
		}
	
		if (game_platform==='GOOGLE_PLAY') {
			if (typeof Android !== 'undefined') {
				Android.showAdFromJs();
			}			
		}
	
	},
	
	show2 : async function() {
		
		
		if (game_platform ==="YANDEX") {
			
			let res = await new Promise(function(resolve, reject){				
				window.ysdk.adv.showRewardedVideo({
						callbacks: {
						  onOpen: () => {},
						  onRewarded: () => {resolve('ok')},
						  onClose: () => {resolve('err')}, 
						  onError: (e) => {resolve('err')}
					}
				})
			
			})
			return res;
		}
		
		if (game_platform === "VK") {	

			let res = '';
			try {
				res = await vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
			}
			catch(error) {
				res ='err';
			}
			
			return res;				
			
		}	
		
		return 'err';
		
	}

}

confirm_dialog = {
	
	p_resolve : 0,
		
	show: function(msg) {
								
		if (objects.confirm_cont.visible === true) {
			sound.play('locked')
			return;			
		}		
		
		sound.play("confirm_dialog");
				
		objects.confirm_msg.text=msg;
		
		anim2.add(objects.confirm_cont,{y:[450,objects.confirm_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			confirm_dialog.p_resolve = resolve;	  		  
		});
	},
	
	button_down : function(res) {
		
		if (objects.confirm_cont.ready===false)
			return;
		
		sound.play('click')

		this.close();
		this.p_resolve(res);	
		
	},
	
	close : function() {
		
		anim2.add(objects.confirm_cont,{y:[objects.confirm_cont.sy,450]}, false, 0.4,'easeInBack');		
		
	}

}

keep_alive= function() {
	
	fbs.ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);

}

keyboard={
	
	resolver : 0,
	callback:function(t){},
	//x,y,x2,y2
	keys_data:[[501,8.38,561,45.88,'<<'],[13.73,8.38,46.04,45.88,'Й'],[53.44,8.38,85.75,45.88,'Ц'],[93.15,8.38,125.46,45.88,'У'],[132.85,8.38,165.16,45.88,'К'],[172.56,8.38,204.87,45.88,'Е'],[212.27,8.38,244.58,45.88,'Н'],[251.97,8.38,284.28,45.88,'Г'],[291.68,8.38,323.99,45.88,'Ш'],[331.39,8.38,363.7,45.88,'Щ'],[371.09,8.38,403.4,45.88,'З'],[410.8,8.38,443.11,45.88,'Х'],[450.51,8.38,482.82,45.88,'Ъ'],[13.73,53.97,49.65,91.47,'Ф'],[57.05,53.97,92.97,91.47,'Ы'],[100.37,53.97,136.29,91.47,'В'],[143.68,53.97,179.6,91.47,'А'],[187,53.97,222.92,91.47,'П'],[230.32,53.97,266.24,91.47,'Р'],[273.63,53.97,309.55,91.47,'О'],[316.95,53.97,352.87,91.47,'Л'],[360.27,53.97,396.19,91.47,'Д'],[403.58,53.97,439.5,91.47,'Ж'],[446.9,53.97,482.82,91.47,'Э'],[70.79,98.75,103.66,136.25,'Я'],[111.05,98.75,143.92,136.25,'Ч'],[151.31,98.75,184.18,136.25,'С'],[191.58,98.75,224.45,136.25,'М'],[231.84,98.75,264.71,136.25,'И'],[272.11,98.75,304.98,136.25,'Т'],[312.37,98.75,345.24,136.25,'Ь'],[352.64,98.75,385.51,136.25,'Б'],[392.9,98.75,425.77,136.25,'Ю'],[501,98.75,560.66,136.25,'OK'],[501,53.97,561,91.47,'ПАС']],
	
	open(){		
		
		this.show();
		
		return new Promise(resolve=>{			
			keyboard.resolver=resolve;			
		})
		
	},
	
	kill(){
		
		if (typeof this.resolver === 'function') this.resolver('KILL');	
		
	},
	
	show(){		
		
		objects.keyboard_text.text='';
		anim2.add(objects.keyboard_cont,{y:[450, objects.keyboard_cont.sy]}, true, 0.5,'linear');
		
	},
			
	close(){
		
		if(this.resolver) this.resolver();
		anim2.add(objects.keyboard_cont,{y:[objects.keyboard_cont.y,450]}, false, 0.5,'linear');
		
	},
		
	keydown(key){				
		
		//*******это нажатие с клавиатуры
		if(!objects.keyboard_cont.visible) return;
		
		sound.play('keypress');
		key = key.toUpperCase();	
		
		if (objects.host_bank_ask.visible){
			
			if(key==='ENTER')
				game.bank_opt_res(1);
			
			if(key==='ESCAPE')
				game.bank_opt_res(0);
			
			return;		
		}
		
			
				
		if(key==='BACKSPACE') key ='<<';
		if(key==='ENTER') key ='OK';
			
		var key2 = this.keys_data.find(k => {return k[4] === key})			
				
		this.process_key(key2)
		
	},
	
	get_key_from_touch(e){
		
		//координаты нажатия в плостоки спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.keyboard.x;
		let my = e.data.global.y/app.stage.scale.y - objects.keyboard.y;
				
		//ищем попадание нажатия на кнопку
		let margin = 5;
		for (let k of this.keys_data)	
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin)
				return k;
		return null;		
	},
		
	pointerdown(e){
		
		//if (!game.on) return;
		
		//звук нажатой клавиши
		sound.play('keypress');
		
		//получаем значение на которое нажали
		const key=this.get_key_from_touch(e);
		
		//дальнейшая обработка нажатой команды
		this.process_key(key);		

	},
	
	highlight_key(key_data){
		
		const [x,y,x2,y2,key]=key_data
		
		//подсвечиваем клавишу
		objects.hl_key.width=x2-x;
		objects.hl_key.height=y2-y;
		
		objects.hl_key.x = x+objects.keyboard.x;
		objects.hl_key.y = y+objects.keyboard.y;	
		
		anim2.add(objects.hl_key,{alpha:[1, 0]}, false, 0.5,'linear');
		
	},
	
	process_key(key_data){

		if(!key_data) return;
		
		if (objects.keyboard_text.text.length>40) return;
		
		const key=key_data[4];
		
		//подсвечиваем...
		this.highlight_key(key_data);
		
		if(key==='<<'){			
			objects.keyboard_text.text=objects.keyboard_text.text.slice(0, -1);
			return;
		}
		
		if(key==='OK'){			
			
			//если ничего не написано
			if (!objects.keyboard_text.text) return;		
			if (typeof this.resolver === 'function') this.resolver(objects.keyboard_text.text);	
			this.callback(objects.keyboard_text.text);
			objects.keyboard_text.text=''
			return;
		}	

		if(key==='ПАС'){			
					
			if (typeof this.resolver === 'function') this.resolver('ПАС');			
			objects.keyboard_text.text=''
			this.callback(key);
			return;
		}			

		//добавляем значение к слову
		objects.keyboard_text.text+=key;		
	}
		
}

chat_keyboard={
			
	keys_data : [[40,166.05,70,205.12,'1'],[80,166.05,110,205.12,'2'],[120,166.05,150,205.12,'3'],[160,166.05,190,205.12,'4'],[200,166.05,230,205.12,'5'],[240,166.05,270,205.12,'6'],[280,166.05,310,205.12,'7'],[320,166.05,350,205.12,'8'],[360,166.05,390,205.12,'9'],[400,166.05,430,205.12,'0'],[481,166.05,531,205.12,'<'],[60,214.88,90,253.95,'Й'],[100,214.88,130,253.95,'Ц'],[140,214.88,170,253.95,'У'],[180,214.88,210,253.95,'К'],[220,214.88,250,253.95,'Е'],[260,214.88,290,253.95,'Н'],[300,214.88,330,253.95,'Г'],[340,214.88,370,253.95,'Ш'],[380,214.88,410,253.95,'Щ'],[420,214.88,450,253.95,'З'],[460,214.88,490,253.95,'Х'],[500,214.88,530,253.95,'Ъ'],[80,263.72,110,302.79,'Ф'],[120,263.72,150,302.79,'Ы'],[160,263.72,190,302.79,'В'],[200,263.72,230,302.79,'А'],[240,263.72,270,302.79,'П'],[280,263.72,310,302.79,'Р'],[320,263.72,350,302.79,'О'],[360,263.72,390,302.79,'Л'],[400,263.72,430,302.79,'Д'],[440,263.72,470,302.79,'Ж'],[480,263.72,510,302.79,'Э'],[60,312.56,90,351.63,'!'],[100,312.56,130,351.63,'Я'],[140,312.56,170,351.63,'Ч'],[180,312.56,210,351.63,'С'],[220,312.56,250,351.63,'М'],[260,312.56,290,351.63,'И'],[300,312.56,330,351.63,'Т'],[340,312.56,370,351.63,'Ь'],[380,312.56,410,351.63,'Б'],[420,312.56,450,351.63,'Ю'],[501,312.56,531,351.63,')'],[441,166.05,471,205.12,'?'],[20,361.4,170,400.47,'ЗАКРЫТЬ'],[180,361.4,410,400.47,' '],[420,361.4,560,400.47,'ОТПРАВИТЬ'],[521,263.72,551,302.79,','],[461,312.56,491,351.63,'('],[20,263.72,70,302.79,'EN']],
	MAX_SYMBOLS : 60,
	
	open() {			
	
		//если какой-то ресолвер открыт
		if(this.resolver) this.resolver();
		
		objects.chat_keyboard_text.text ='';
		objects.chat_keyboard_control.text = `0/${this.MAX_SYMBOLS}`
				
		anim2.add(objects.chat_keyboard_cont,{y:[-400, objects.chat_keyboard_cont.sy]}, true, 0.4,'easeOutBack');	
		
		return new Promise(function(resolve, reject){					
			chat_keyboard.resolver = resolve;	  		  
		});		
	},	
	
	close () {		
		
		anim2.add(objects.chat_keyboard_cont,{y:[objects.chat_keyboard_cont.y,450]}, false, 0.4,'easeInBack');		
		
	},
		
	get_key_from_touch(e){
		
		//координаты нажатия в плостоки спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.chat_keyboard_cont.x-10;
		let my = e.data.global.y/app.stage.scale.y - objects.chat_keyboard_cont.y-10;
				
		//ищем попадание нажатия на кнопку
		let margin = 5;
		for (let k of this.keys_data)	
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin)
				return k;
		return null;		
	},
	
	keydown (key) {		
		
		//*******это нажатие с клавиатуры
		if(!objects.chat_keyboard_cont.visible) return;	
		
		key = key.toUpperCase();
		
		if(key==='BACKSPACE') key ='<';
		if(key==='ENTER') key ='ОТПРАВИТЬ';
		if(key==='ESCAPE') key ='ЗАКРЫТЬ';
			
		var key2 = this.keys_data.find(k => {return k[4] === key})			
				
		this.process_key(key2)		
		
	},	
	
	pointerdown (e) {
		
		//if (!game.on) return;
				
		//получаем значение на которое нажали
		const key=this.get_key_from_touch(e);
		
		//дальнейшая обработка нажатой команды
		this.process_key(key);	
	},	
	
	highlight_key(key_data){
		
		const [x,y,x2,y2,key]=key_data
		
		//подсвечиваем клавишу
		objects.chat_keyboard_hl.width=x2-x;
		objects.chat_keyboard_hl.height=y2-y;
		
		objects.chat_keyboard_hl.x = x+objects.chat_keyboard.x;
		objects.chat_keyboard_hl.y = y+objects.chat_keyboard.y;	
		
		anim2.add(objects.chat_keyboard_hl,{alpha:[1, 0]}, false, 0.5,'linear');
		
	},	
	
	close(){
		
		anim2.add(objects.chat_keyboard_cont,{y:[objects.chat_keyboard_cont.y,450]}, false, 0.4,'easeInBack');	

	},
		
	process_key(key_data){

		if(!key_data) return;	

		let key=key_data[4];	

		//звук нажатой клавиши
		sound.play('keypress');				
		
		if (key==='ОТПРАВИТЬ'){
			chat.send(objects.chat_keyboard_text.text);				
			this.close();
			key ='';		
		}

		if (key==='ЗАКРЫТЬ'){
			this.close();
			key ='';		
		}
		
		if (key==='<'){
			objects.chat_keyboard_text.text=objects.chat_keyboard_text.text.slice(0, -1);
			key ='';		
		}
		
		if (objects.chat_keyboard_text.text.length>=this.MAX_SYMBOLS) return;
		
		//подсвечиваем...
		this.highlight_key(key_data);			

		//добавляем значение к слову
		if (key.length===1) objects.chat_keyboard_text.text+=key;
		
		objects.chat_keyboard_control.text = `${objects.chat_keyboard_text.text.length}/${this.MAX_SYMBOLS}`		
		
	}
		
}

tables_menu={
	
	chat_activated:0,
	hinst_timer:-1,
	sec_to_hint0:3600,
	sec_to_hint1:1800,
	
	activate(){				
				
		//это чат
		chat.activate();
				
		anim2.add(objects.table1_data_cont,{y:[-150,objects.table1_data_cont.sy]}, true, 0.25,'linear');
		anim2.add(objects.table2_data_cont,{y:[-150,objects.table2_data_cont.sy],alpha:[0,0.5]}, true, 0.25,'linear');
		anim2.add(objects.table3_data_cont,{y:[-150,objects.table3_data_cont.sy],alpha:[0,0.5]}, true, 0.25,'linear');

		anim2.add(objects.hints_cont,{x:[800,objects.hints_cont.sx]}, true, 0.25,'linear');

		objects.exit_button.pointerdown=function(){tables_menu.exit_down()};
		objects.control_buttons.y=190;
		objects.chat_button.visible=true;
		objects.control_buttons.visible=true;		
		
		if (this.hinst_timer===-1)
			this.hinst_timer=setInterval(function(){tables_menu.process_hints()},1000);

		fbs.ref('room1/pending').on('value',function(data){			
			tables_menu.table_data_updated(objects.t_table1_players_num,data.val())
		})
		
		fbs.ref('room2/pending').on('value',function(data){			
			tables_menu.table_data_updated(objects.t_table2_players_num,data.val())
		})
		
		fbs.ref('room3/pending').on('value',function(data){			
			tables_menu.table_data_updated(objects.t_table3_players_num,data.val())
		})
	
	
	},
	
	exit_down(){
		
		if(anim2.any_on())return;
		this.close();
		main_menu.activate();		
		
	},
	
	sec_to_format(sec){
		
		let minutes = Math.floor(sec / 60);
		let remainingSeconds = sec % 60;
		return minutes+'м '+remainingSeconds+'с';		
		
	},
	
	process_hints(){

		if (this.sec_to_hint0>0){
			this.sec_to_hint0--;		
			objects.t_time_hint0.text=this.sec_to_format(this.sec_to_hint0);				
			
			if (this.sec_to_hint0===0){				
				objects.t_time_hint0.visible=false;
				objects.hint0_pic.alpha=1;		
				game.first_letter_bonus=1;
				sound.play('hint_on');
				clearInterval(this.hinst_timer);
			}
		}

		
		if (this.sec_to_hint1>0){
			this.sec_to_hint1--;		
			objects.t_time_hint1.text=this.sec_to_format(this.sec_to_hint1);				
			
			if (this.sec_to_hint1===0){				
				objects.t_time_hint1.visible=false;
				objects.hint1_pic.alpha=1;	
				game.num_of_letters_bonus=1;
				sound.play('hint_on');
			}
		}
		
		
	},
	
	table_data_updated(table_players_num,data){

		let num_of_players=0;
		if (data) num_of_players=Object.keys(data).length;
		
		table_players_num.text=['Игроков: ','Players: '][LANG]+num_of_players+'/8';
		
	},
	
	init_payments(){
		
		if(this.payments) return;
		
		ysdk.getPayments({ signed: true }).then(_payments => {
			tables_menu.payments = _payments;
			}).catch(err => {
		})			
		
	},
	
	chat_button_down(){
		
		
		chat_keyboard.open();
		
	},
	
	table_down(room){
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		if(room==='room2'){
			sound.play('locked');
			return;
		}
		
		if(room==='room3'){
			sound.play('locked');
			return;
		}
		
		room_id=room;
		game.activate();
		this.close();
		
	},	
	
	close(){
		
		objects.control_buttons.visible=false;
		chat.close();
		
		fbs.ref('table1/pending').off();
		fbs.ref('table2/pending').off();	
		fbs.ref('table3/pending').off();	

		anim2.add(objects.hints_cont,{x:[objects.hints_cont.x,800]}, false, 0.25,'linear');
		
		anim2.add(objects.table1_data_cont,{y:[objects.table1_data_cont.y,-150]}, false, 0.25,'linear');
		anim2.add(objects.table2_data_cont,{y:[objects.table2_data_cont.y,-150]}, false, 0.25,'linear');
		anim2.add(objects.table3_data_cont,{y:[objects.table2_data_cont.y,-150]}, false, 0.25,'linear');
	}
	
}

main_menu= {

	async activate() {

		some_process.main_menu=main_menu.process;
		anim2.add(objects.mb_cont,{y:[450,objects.mb_cont.sy]}, true, 1,'linear');
		anim2.add(objects.main_title,{y:[-300,objects.main_title.sy]}, true, 1,'easeInOutCubic');
		anim2.add(objects.girl,{x:[-400,objects.girl.sx]}, true, 2,'easeInOutCubic');
		anim2.add(objects.online_icon,{scale_x:[0,0.6666]}, true, 2,'easeOutBack');
		
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.6,'linear');
		
		//vk
		if (game_platform==='VK')
		anim2.add(objects.vk_buttons_cont,{y:[-100,objects.vk_buttons_cont.sy]}, true, 0.65,'linear');	
		
		
		music.activate();
	},
	
	async close() {
		some_process.main_menu=function(){};
		anim2.add(objects.mb_cont,{y:[objects.mb_cont.y,450]}, false, 0.5,'linear');
		anim2.add(objects.main_title,{y:[objects.main_title.y,-300]}, false, 0.3,'linear');
		anim2.add(objects.girl,{x:[objects.girl.x,-400]}, false, 0.4,'linear');
		anim2.add(objects.online_icon,{alpha:[1,0]}, false, 0.6,'linear');		

		//vk
		if(objects.vk_buttons_cont.visible)
			anim2.add(objects.vk_buttons_cont,{y:[objects.vk_buttons_cont.y,-100]}, false, 0.75,'linear');	
	},

	async pb_down() {

		if (anim2.any_on()===true || objects.id_cont.visible === true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		tables_menu.activate();

	},
	
	async lb_button_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		lb.show();

	},

	async rules_button_down() {

		if(!objects.mb_cont.ready)
			return;
		anim2.add(objects.rules_pic,{y:[-450, objects.rules_pic.sy]}, true, 0.2,'easeOutBack');
	},

	process(){
		
		objects.online_icon.alpha=Math.abs(Math.sin(game_tick*2));
		
		if (objects.girl.ready){
			let x=((game_tick*5) % 16)-8;
			const x2=x*x;		
			objects.girl.x=objects.girl.sx+30*(1-x2)*Math.exp(-0.5*x2);			
		}

		
		objects.main_title.angle=3*Math.sin(game_tick);
		
	},

	rules_ok_down() {

		if(!objects.rules_pic.ready)
			return;
		anim2.add(objects.rules_pic,{y:[objects.rules_pic.y, 450]}, false, 0.2,'easeInBack');

	},

}

lb={
	
	active : 0,
	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],

	show() {

		this.active = 1;
		objects.desktop.visible=true;
		//objects.desktop.texture=game_res.resources.lb_bcg.texture;

		
		anim2.add(objects.leader_header,{y:[-50, objects.leader_header.sy]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_1_cont,{x:[-150, objects.lb_1_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_2_cont,{x:[-150, objects.lb_2_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_3_cont,{x:[-150, objects.lb_3_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.lb_back_button,{x:[800, objects.lb_back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 1,'linear');			


		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}


		this.update();

	},

	async close() {

		this.active = 0;
		anim2.add(objects.leader_header,{y:[objects.leader_header.y,-50]}, true, 0.5,'easeInBack');
		anim2.add(objects.lb_1_cont,{x:[objects.lb_1_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_2_cont,{x:[objects.lb_2_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_3_cont,{x:[objects.lb_3_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_cards_cont,{x:[objects.lb_cards_cont.x, 450]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_back_button,{x:[objects.lb_back_button.x, 800]}, false, 0.5,'easeInBack');
		await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.6,'linear');		

	},

	async back_button_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
		await this.close();
		main_menu.activate();

	},

	update() {

		fbs.ref("players").orderByChild('rating').limitToLast(25).once('value').then((snapshot) => {

			if (snapshot.val()===null) {
			  //console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {

				var players_array = [];
				snapshot.forEach(players_data=> {
					if (players_data.val().name!=="" && players_data.val().name!=='')
						players_array.push([players_data.val().name, players_data.val().rating, players_data.val().pic_url]);
				});


				players_array.sort(function(a, b) {	return b[1] - a[1];});

				//создаем загрузчик топа
				var loader = new PIXI.Loader();

				var len=Math.min(10,players_array.length);

				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					if (players_array[i]!== undefined) {						
						make_text(objects['lb_'+(i+1)+'_name'],players_array[i][0],180);					
						objects['lb_'+(i+1)+'_rating'].text=players_array[i][1];
						loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});						
					}
				};

				//загружаем остальных
				for (let i=3;i<10;i++) {
					if (players_array[i]!== undefined) {
						
						let fname=players_array[i][0];
						make_text(objects.lb_cards[i-3].name,fname,180);
						objects.lb_cards[i-3].rating.text=players_array[i][1];
						loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});						
					} 
				};

				loader.load();

				//показываем аватар как только он загрузился
				loader.onProgress.add((loader, resource) => {
					let lb_num=Number(resource.name.slice(-1));
					if (lb_num<3)
						objects['lb_'+(lb_num+1)+'_avatar'].texture=resource.texture
					else
						objects.lb_cards[lb_num-3].avatar.texture=resource.texture;
				});

			}

		});

	}

}

vk={
	
	invite_button_down(){
		if (anim2.any_on())
			return;
		
		sound.play('click');
		vkBridge.send('VKWebAppShowInviteBox');
		anim2.add(objects.vk_buttons_cont,{y:[objects.vk_buttons_cont.y,-100]}, false, 0.75,'linear');	
		
	},
	
	share_button_down(){
		
		if (anim2.any_on())
			return;
		
		sound.play('click');
		vkBridge.send('VKWebAppShowWallPostBox', { message: 'Я играю в Слабое Звено Онлайн и мне нравится!','attachments': 'https://vk.com/app51767594'})
		anim2.add(objects.vk_buttons_cont,{y:[objects.vk_buttons_cont.y,-100]}, false, 0.75,'linear');	
		
	}
	
	
}

rules={
	
	active : 0,
	
	activate : function() {
		
		this.active = 1;
		anim2.add(objects.desktop,{alpha:[0,0.5]}, true, 0.6,'linear');	
		anim2.add(objects.rules_back_button,{x:[800, objects.rules_back_button.sx]}, true, 0.5,'easeOutCubic');
				
	},
	
	back_button_down : async function() {
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		
		sound.play('click');
		await this.close();
		main_menu.activate();
		
	},
	
	close : async function() {
		
		this.active = 0;
		anim2.add(objects.rules_text,{alpha:[1, 0]}, false, 0.5,'linear');
		anim2.add(objects.desktop,{alpha:[1, 0]}, false, 0.5,'linear');
		await anim2.add(objects.rules_back_button,{x:[objects.rules_back_button.x, 800]}, false, 0.5,'easeInCubic');
		
		
	}	
		
}

auth2={
		
	load_script : function(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
			
	get_random_char : function() {		
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];
		
	},
	
	get_random_uid_for_local : function(prefix) {
		
		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();
		
		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}
					
		return uid;
		
	},
	
	get_random_name : function(uid) {
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		
		if (uid !== undefined) {
			
			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);				
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;	
			return rnd_names[e_num1] + name_postfix.substring(0, 3);					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}	
	},	
	
	get_country_code : async function() {

		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json");
			let resp2 = await resp1.json();			
			country_code = resp2.country || '';			
		} catch(e){}

		return country_code;
		
	},
	
	search_in_local_storage : function() {
		
		//ищем в локальном хранилище
		let local_uid = null;
		
		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}
				
		if (local_uid !== null) return local_uid;
		
		return undefined;	
		
	},
	
	init : async function() {	
				
		if (game_platform === 'GM') {
			
			try {await this.load_script('https://api.gamemonetize.com/sdk.js')} catch (e) {alert(e)};
			
			window.SDK_OPTIONS = {
				gameId: "itlfj6x5pluki04lefb9z3n73xedj19x",
				onEvent: function (a) {
					switch (a.name) {
						case "SDK_GAME_PAUSE":
						   // pause game logic / mute audio
						   break;
						case "SDK_GAME_START":
						   // advertisement done, resume game logic and unmute audio
						   break;
						case "SDK_READY":
						   // when sdk is ready
						   break;
					}
				}
			
			}
			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GM_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			
		}
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.pic_url = _player.getPhoto('medium');
			
			if (my_data.pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
			
		
			return;
		}
		
		if (game_platform === 'VK') {
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= "vk"+_player.id;
			my_data.pic_url = _player.photo_100;
			
			return;
			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			return;
		}
		
		if (game_platform === 'RUSTORE') {	

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('RS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			return;
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';		
			return;
		}
		
		if (game_platform === 'CRAZYGAMES') {
			
			let country_code = await this.get_country_code();
			try {await this.load_script('https://sdk.crazygames.com/crazygames-sdk-v1.js')} catch (e) {alert(e)};			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('CG_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			let crazysdk = window.CrazyGames.CrazySDK.getInstance();
			crazysdk.init();			
			return;
		}
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			//alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
		}
	
		
	
	}
	
}

function resize() {
	
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh);
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

function vis_change() {

	if (document.hidden === true){
		
		game.sound_switch_down(0);
		music.switch(1);
		hidden_state_start = Date.now();
		fbs.ref(room_id+'/pending/'+my_data.uid).remove();	
	}
	
	if (document.hidden === false){

		//sound.on=1;
		hidden_state_start = Date.now();				
	}
	
		
}

async function load_resources() {


	//это нужно удалить потом
	/*document.body.innerHTML = "Привет!\nДобавляем в игру некоторые улучшения))\nЗайдите через 40 минут.";
	document.body.style.fontSize="24px";
	document.body.style.color = "red";
	return;*/

	document.getElementById("m_progress").style.display = 'flex';

	let git_src="https://akukamil.github.io/chain/"
	//git_src=""

	//подпапка с ресурсами
	let lang_pack = ['RUS','ENG'][LANG];	

	game_res=new PIXI.Loader();	
	
	game_res.add("m2_font", git_src+"fonts/Bahnschrift/font.fnt");

	game_res.add('applause',git_src+'sounds/applause.mp3');
	game_res.add('super_game',git_src+'sounds/super_game.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('hint_on',git_src+'sounds/hint_on.mp3');
	game_res.add('win',git_src+'sounds/win.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('host_message',git_src+'sounds/host_message.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('clock',git_src+'sounds/clock.mp3');
	game_res.add('correct_ans',git_src+'sounds/correct_ans.mp3');
	game_res.add('wrong_ans',git_src+'sounds/wrong_ans.mp3');
	game_res.add('vote_done',git_src+'sounds/vote_done.mp3');
	game_res.add('keypress',git_src+'sounds/keypress.mp3');
	game_res.add('voting',git_src+'sounds/voting.mp3');
	game_res.add('money',git_src+'sounds/money.mp3');
	game_res.add('music',git_src+'sounds/music.mp3');
	
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++) {
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+'res/'+lang_pack + '/' + load_list[i].name + "." +  load_list[i].image_format);
        if (load_list[i].class === "asprite" )
            game_res.add(load_list[i].name, git_src+"gifs/" + load_list[i].res_name);
	}


	game_res.onProgress.add(progress);
	function progress(loader, resource) {
		document.getElementById("m_bar").style.width =  Math.round(loader.progress)+"%";
	}
	
	await new Promise((resolve, reject)=> game_res.load(resolve))
	
	//убираем элементы загрузки
	document.getElementById("m_progress").outerHTML = "";	

	//короткое обращение к ресурсам
	gres=game_res.resources;

}

language_dialog = {
	
	p_resolve : {},
	
	show : function() {
				
		return new Promise(function(resolve, reject){


			document.body.innerHTML='<style>		html,		body {		margin: 0;		padding: 0;		height: 100%;	}		body {		display: flex;		align-items: center;		justify-content: center;		background-color: rgba(24,24,64,1);		flex-direction: column	}		.two_buttons_area {	  width: 70%;	  height: 50%;	  margin: 20px 20px 0px 20px;	  display: flex;	  flex-direction: row;	}		.button {		margin: 5px 5px 5px 5px;		width: 50%;		height: 100%;		color:white;		display: block;		background-color: rgba(44,55,100,1);		font-size: 10vw;		padding: 0px;	}  	#m_progress {	  background: rgba(11,255,255,0.1);	  justify-content: flex-start;	  border-radius: 100px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 10px 40px -10px #fff;	  border-radius: 100px;	  background: #fff;	  height: 70%;	  width: 0%;	}	</style><div id ="two_buttons" class="two_buttons_area">	<button class="button" id ="but_ref1" onclick="language_dialog.p_resolve(0)">RUS</button>	<button class="button" id ="but_ref2"  onclick="language_dialog.p_resolve(1)">ENG</button></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
			language_dialog.p_resolve = resolve;	
						
		})
		
	}
	
}

async function define_platform_and_language(env) {
	
	let s = window.location.href;
	
	if (env === 'game_monetize') {
				
		game_platform = 'GM';
		LANG = await language_dialog.show();
		return;
	}
	
	if (s.includes('yandex')) {
		
		game_platform = 'YANDEX';
		
		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else 
			LANG = 1;		
		return;
	}
	
	if (s.includes('vk.com')) {
		game_platform = 'VK';	
		LANG = 0;	
		return;
	}
	
	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = 0;
		return;
	}	

	if (s.includes('rustore')) {
			
		game_platform = 'RUSTORE';	
		LANG = 0;
		return;	
	}	
	
	if (s.includes('192.168')) {
			
		game_platform = 'DEBUG';	
		LANG = await language_dialog.show();
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = 0;
	
	

}

async function check_blocked(){
	
	//загружаем остальные данные из файербейса
	const block_data = await fbs_once('blocked/' + my_data.uid);
	if (block_data) my_data.blocked=1;
	
}

async function load_questions(){
	
	try {
	  const response = await fetch('https://akukamil.github.io/chain/q.txt');
	  if (!response.ok) throw new Error('Error fetching data');
	  const text_data = await response.text();
	  _q=JSON.parse(text_data);
	  if (Array.isArray(_q)&&_q.length>100) {
		  QUESTIONS=_q;
		  console.log('Вопросы загружены!');
	  }

	} catch (error) {
	  console.error('Error:', error.message);
	}	
	
	
}

async function init_game_env(env) {
			

	//document.body.style.backgroundColor = "black";
	//document.body.innerHTML = '<span style="color: yellow; background-color:black; font-size: 34px;">ИГРА БУДЕТ ДОСТУПНА ЧУТЬ ПОЗЖЕ</span>';
	//return;
			
	await define_platform_and_language(env);
	console.log(game_platform, LANG);
						
	//отображаем шкалу загрузки
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;	}body {display: flex;align-items: center;justify-content: center;background-color: rgba(41,41,41,1);flex-direction: column	}#m_progress {	  background: #1a1a1a;	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;	  border-radius: 5px;	  background: rgb(119, 119, 119);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
	await load_resources();
	
	await auth2.init();
	
	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({			
			apiKey: "AIzaSyARERb887Wgdor9peToBWx_FpdeXFs-QC8",
			authDomain: "chain-9664b.firebaseapp.com",
			databaseURL: "https://chain-9664b-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "chain-9664b",
			storageBucket: "chain-9664b.appspot.com",
			messagingSenderId: "373843092599",
			appId: "1:373843092599:web:851969c98e7798ab211272"
		});
	}
	
	//короткое обращение к базе данных
	fbs=firebase.database();

	//создаем приложение пикси и добавляем тень
	app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.view).style["boxShadow"] = "0 0 15px #000000";
	
	//изменение размера окна
	resize();
	window.addEventListener("resize", resize);

    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)

        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;
			
        case "asprite":
			objects[obj_name] = gres[obj_name].animation;
            eval(load_list[i].code0);
            break;
			
        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
				
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;
			
        case "asprite":	
			eval(load_list[i].code1);
            break;
			
        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }

	//запускаем главный цикл
	main_loop();

	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}

	//загружаем аватарку игрока
	let loader=new PIXI.Loader();
	await new Promise(function(resolve, reject) {		
		loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
		loader.load(function(l,r) {	resolve(l)});
	});

	//устанавливаем фотки в попап и другие карточки
	objects.id_avatar.texture = loader.resources.my_avatar.texture;
		
	document.addEventListener("visibilitychange", vis_change);
	window.addEventListener('keydown', function(event) { keyboard.keydown(event.key); chat_keyboard.keydown(event.key)});

		
	//загружаем остальные данные из файербейса
	const other_data = await fbs_once('players/' + my_data.uid);
		
	my_data.rating = (other_data && other_data.rating) || 0;
	my_data.games = (other_data && other_data.games) || 0;
	my_data.name = my_data?.name||other_data?.name||'no_name';
		
	//my_data.rating={'debug100':1000,'debug99':500,'debug98':100}[my_data.uid];	
	//my_data.rating=0;
	
	//идентификатор клиента
	client_id = irnd(10,999999);
				
	//получаем информацию о стране
	const country =  (other_data && other_data.country) || await auth2.get_country_code();
					
	//устанавливаем рейтинг в попап
	objects.id_rating.text=my_data.rating;
	
	//обновляем базовые данные в файербейс так могло что-то поменяться
	fbs.ref("players/"+my_data.uid+"/name").set(my_data.name);
	fbs.ref("players/"+my_data.uid+"/country").set(country);
	fbs.ref("players/"+my_data.uid+"/pic_url").set(my_data.pic_url);				
	fbs.ref("players/"+my_data.uid+"/rating").set(my_data.rating);
	fbs.ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	
	//добавляем страну в имя
	my_data.name = my_data.name+' (' +country +')'
	
	//устанавлием мое имя в карточки
	make_text(objects.id_name,my_data.name,150);
	
	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);
	
	//загружаем слова
	await load_questions();

	//ждем одну секунду
	await new Promise((resolve, reject) => {setTimeout(resolve, 1000);});

	some_process.loup_anim = function(){};

	//убираем контейнер
	anim2.add(objects.id_cont,{y:[objects.id_cont.sy, -200]}, false, 0.5,'easeInBack');
	
	//контроль за присутсвием
	var connected_control = fbs.ref(".info/connected");
	connected_control.on("value", (snap) => {
	  if (snap.val() === true) {
		connected = 1;
	  } else {
		connected = 0;
	  }
	});

	//показыаем основное меню
	main_menu.activate();
	
}

function main_loop() {


	game_tick+=0.016666666;
	anim2.process();
	
	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();	
	
	requestAnimationFrame(main_loop);	
	
}
