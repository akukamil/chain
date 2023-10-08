var M_WIDTH=800, M_HEIGHT=450;
var app,chat_path,gdata={}, game_res, game, objects={}, LANG = 0, state="", game_tick = 0, game_id = 0, connected = 1, client_id =0, h_state = 0, game_platform = "",
hidden_state_start=0,fbs=null, pending_player='', opponent={}, my_data={opp_id : ''}, players_cache={BOT:{name:'Rebecca',pic_url:'123'}},
opp_data={}, some_process={},git_src='', ME=0,OPP=1,WIN=1,DRAW=0,LOSE=-1,NOSYNC=2,turn=0,BET=0,BIG_BLIND=2;

let room_id='room1';
const BANK_DATA=[0,100,200,300,400,500,1000,2000,3000,4000,5000];
const QUESTIONS=[['КРАСНЫЙ ВКУСНЫЙ ОВОЩ','ПОМИДОР'],['СПЕЛОЕ, НАЛИВНОЕ','ЯБЛОКО'],['ЕДЕНИЦА ИЗМЕРЕНИЯ РАССТОЯНИЯ НА БУКУ К','КИЛОМЕТР']];

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
		this.resolver=0;
		this.text=new PIXI.BitmapText('***', {fontName: 'mfont',fontSize:25,lineSpacing:37}); 
		this.text.tint=0x55bbdd;
		this.text.maxWidth=290;
		
		this.name_text=new PIXI.BitmapText('***', {fontName: 'mfont',fontSize: 25}); 
		this.name_text.tint=0xbbff00;
		
		this.visible=false;
		this.addChild(this.text,this.name_text)
		
	}
	
	async set(name,text,color){
		
		sound.play('inst_msg');
		name=name.substr(0,7);
		this.text.text=name+': '+text;
		this.name_text.text=name+':';
		this.name_text.tint=color||0xFFFFFF;	
		this.visible=true;


		
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
		this.avatar_hl.width=this.avatar_hl.height=90;
		this.avatar_hl.x=-10;
		this.avatar_hl.y=-10;		
		this.avatar_hl.visible=false;
		
		this.avatar_hl_vote=new PIXI.Sprite(gres.avatar_hl_red.texture);
		this.avatar_hl_vote.width=this.avatar_hl_vote.height=90;
		this.avatar_hl_vote.x=-10;
		this.avatar_hl_vote.y=-10;		
		this.avatar_hl_vote.visible=false;
				
		this.avatar_mask=new PIXI.Sprite(gres.avatar_mask.texture);
		this.avatar_mask.width=this.avatar_mask.height=70;
		this.avatar_mask.x=0;
		this.avatar_mask.y=0;
		
		this.avatar=new PIXI.Sprite(gres.girl_photo.texture);
		this.avatar.width=this.avatar.height=50;
		this.avatar.x=10;
		this.avatar.y=10;
		this.avatar.interactive=this.avatar.buttonMode=true;
		const t=this;
		this.avatar.pointerdown=function(){game.avatar_down(t)};
		
		this.avatar.mask=this.avatar_mask;
		
		this.avatar_frame=new PIXI.Sprite(gres.avatar_frame.texture);
		this.avatar_frame.width=this.avatar_frame.height=70;
		
		this.cross=new PIXI.Sprite(gres.cross_img.texture);
		this.cross.x=this.cross.y=35;
		this.cross.width=this.cross.height=70;
		this.cross.anchor.set(0.5,0.5);
		this.cross.visible=false;
		
		
		this.vote_bcg=new PIXI.Sprite(gres.vote_bcg.texture);
		this.vote_bcg.width=this.vote_bcg.height=50;
		this.vote_bcg.x=30;
		this.vote_bcg.y=-10;
		this.vote_bcg.visible=false;
		
		this.t_vote_res=new PIXI.BitmapText('0', {fontName: 'mfont', fontSize :22});
		this.t_vote_res.anchor.set(0.5,0.5);
		this.t_vote_res.x=55;
		this.t_vote_res.y=15;
		this.t_vote_res.tint=0x111111;
		this.t_vote_res.visible=false;
						
		this.name=new PIXI.BitmapText('Ирина Т.', {fontName: 'mfont', fontSize :22});
		this.name.anchor.set(0.5,0.5);
		this.name.x=35;
		this.name.y=70;
		this.name.tint=0xffffff;
						
		this.t_rating=new PIXI.BitmapText('9564', {fontName: 'mfont', fontSize :24});
		this.t_rating.x=35;
		this.t_rating.y=90;
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
	
	add_info(info){		
		this.t_comb.text=info;
		anim2.add(this.t_comb,{alpha:[1,0]}, true, 3,'linear');				
	}
	
	async show_income(income){	
		this.t_won.text='+'+income;
		anim2.add(this.t_won,{y:[this.t_won.sy-50,this.t_won.sy],alpha:[0,1]}, true, 0.25,'linear',false);
		await new Promise((resolve, reject) => {setTimeout(resolve, 8000);});
		anim2.add(this.t_won,{y:[this.t_won.y,this.t_won.sy-50],alpha:[1,0]}, false, 0.25,'linear',false);
	}
	
	show_action(event){		
	
		
		
		const action=event.data;
		
		objects.action_info.x=this.x+70;
		objects.action_info.y=this.y+130;
		objects.action_info.t_info.text=event.data;
		
		
		let in_money=event.chips||event.bet_raise;
		if (event.bet_raise!=null)
			in_money=event.bet_raise;
		
		if (event.chips!=null)
			in_money=event.chips;
		
		if(action==='FOLD') in_money=0;
		
		if (in_money) objects.action_info.t_info.text+=' '+in_money;			
		anim2.add(objects.action_info,{alpha:[0,1]}, false, 3,'easeBridge',false);		
	
		if (this.uid!==my_data.uid){
			if(action==='CHECK'||action==='CALL')
				sound.play('check')
			if(action==='BET'||action==='RAISE' )
				sound.play('raise')	
			if(action==='FOLD' )
				sound.play('fold')	
		}

		
	}
			
	set_cards(cards){
		this.card0.card_index=cards[0];
		this.card1.card_index=cards[1];		
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
	
	change_balance(amount){
		
		
		
		
		if(this.uid===my_data.uid){			
			my_data.rating+=amount;		
			if(my_data.rating<0)my_data.rating=0;
			fbs.ref('players/' + my_data.uid + '/rating').set(my_data.rating);
		}
		
		
		this.rating+=amount;
		this.t_rating.text=this.rating;		
		
	}
	
	run_timer(){
		
		objects.timer_bar.scale_x=1;
		objects.timer_bar.x=this.x+30;
		objects.timer_bar.y=this.y+105;
		objects.timer_bar.tm=Date.now();
		objects.timer_bar.visible=true;

	}
	
	open_cards(){
		
		this.card0.open();
		this.card1.open();	
			
		//определяем комбинацию
		const cen_cards_opened=objects.cen_cards.filter(c=>c.opened===1)||[];
		const it_cards=[this.card0.card_index, this.card1.card_index,...cen_cards_opened.map(c=>c.card_index)];

		const comb=hand_check.check(it_cards);
		const kickers=comb.data.map(d=>value_num_to_txt[d.value])
		
		this.hand_value=hand_check.get_total_value(comb);
				
		anim2.kill_anim(this.t_comb)
		this.t_comb.text=comb_to_text[comb.name][LANG]+'\n'+kickers.join('-');	
		this.t_comb.visible=true;
		this.t_comb.alpha=1;
		
	}
	
	close_cards(){
		this.card0.close();
		this.card1.close();		
		this.t_comb.visible=false;
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
	
	add_message(name,text){
		
		const oldest=this.get_old_message();
		oldest.y=this.bottom;
		oldest.set(name,text,0xffffff);
		oldest.visible=true;
		const message_height=oldest.text.textHeight-6;
		this.bottom+=message_height;
		this.cont_total_shift-=message_height;
		anim2.add(objects.chat_cont,{y:[objects.chat_cont.y, objects.chat_cont.sy+this.cont_total_shift]}, true, 0.15,'linear');
		
		
	},
	
	get_old_message(){
		
		const res=objects.messages.find(msg => msg.visible===false);
		if(res) return res;
		
		return objects.messages.reduce((oldest, msg) => {
			return oldest.y < msg.y ? oldest : msg;
		});		
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

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0, visible:false, ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
		
	
	any_on : function() {		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;			
	},
	
	linear: function(x) {
		return x
	},
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj){
					this.slot[i].p_resolve('finished');		
					this.slot[i].obj.ready=true;					
					this.slot[i]=null;	
				}
	
	},
	
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic: function(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine: function(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	easeOutBounce: function(x) {
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
	
	easeBridge(x){
		
		if(x<0.1)
			return x*10;
		if(x>0.9)
			return (1-x)*10;
		return 1		
	},
	
	easeInCubic: function(x) {
		return x * x * x;
	},
	
	ease2back : function(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic: function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake : function(x) {
		
		return Math.sin(x*Math.PI*2);
		
		
	},	
	
	add : function(obj, params, vis_on_end, time, func, block=true) {
				
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
		
	process: function () {
		
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
	
	wait : async function(time) {
		
		await this.add(this.empty_spr,{x:[0, 1]}, false, time,'linear');	
		
	}
}

sound = {
	
	on : 1,
	
	play : function(snd_res) {
				
		if (game_res.resources[snd_res].sound===undefined)
			return;
		
		if (this.on === 0)
			return;
		
		if (game_res.resources[snd_res]===undefined)
			return;
		
		game_res.resources[snd_res].sound.play();	
		
	},
	
	play_delayed (snd_res, delay) {
		
		if (this.on === 0)
			return;
		
		if (game_res.resources[snd_res]===undefined)
			return;
		
		
		setTimeout(function(){game_res.resources[snd_res].sound.play()}, delay);
			
		
	},
	
	stop_all(){
		
		PIXI.sound.stopAll();
	}
	
	
}

host={
	
	bank_resolver:0,
	
	async add_msg(header_text, msg, bank){
				
				
		
		//если уже есть какой-то промис то закрываем его
		if (this.bank_resolver) this.bank_resolver('forced');
		
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
		
	async activate(){
		
		//текущее состояние стола
		await game.analyse_table();			
							
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
						
			if(data.type==='q')
				game.game_question_event(data);	
			
			if(data.type==='out')
				console.log('убрали игрока',data.uid)
			
			if(data.type==='fans')
				game.super_game_ans(data);	
			
			if(data.type==='voting')
				game.start_voting(data);	
			
			if(data.type==='voting_res')
				game.show_voting_res(data);	
			
			if(data.type==='ans')
				game.game_ans(data);	
			
			if(data.type==='super_game')
				game.super_game_start_event(data);				

		});
				
	},
	
	async game_start_event(data){
		
		//расставляем иконки
		for(let i=0;i<objects.pcards.length;i++){
			const card=objects.pcards[i];
			card.x=110+i*82;
		}
				
		this.players=data.players;	

		//скрываем данные от суперигры
		objects.ans_icons_cont.visible=false;
		
		objects.avatars_cont.visible=true;		
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
						
						
		const is_bank=data.put_bank&&data.uid===my_data.uid;
		const q=this.cur_question+'/'+this.num_of_questions;
		this.cur_question++;
		host.add_msg('ВОПРОС '+q,QUESTIONS[data.q_id][0],is_bank)
			
		
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
		
		
		this.start_timer(15);
		
		//если это вопрос не мне
		if(data.uid!==my_data.uid||!this.iam_active) return		
		
		let ans_data = await keyboard.open();
		keyboard.close();
		fbs.ref(room_id+'/players_actions').set({uid:my_data.uid,type:'ans',ans:ans_data,tm:Date.now()})
		
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

		host.add_msg('ИНФО','НАЧИНАЕМ ГОЛОСОВАНИЕ! НАЖМИТЕ НА АВАТАР ИГРОКА КОТОРОГО ВЫ СЧИТАЕТЕ САМЫМ СЛАБЫМ');
		this.start_timer(20);
		
		//чистим карточки
		this.clean_cards();
		
	},
	
	avatar_down(card){
		
		if(card.uid===my_data.uid) return;
		if(card.active===0) return;
		if(!this.voting_on) return;
				
		host.add_msg('ИНФО','ВЫБОР СДЕЛАН! ЖДЕМ ОСТАЛЬНЫХ ИГРОКОВ...');
		
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
		if(weakest_card.uid===my_data.uid) this.iam_active=0;
		
		//показываем сообщение
		host.add_msg('ИНФО',weakest_card.name.text+' САМОЕ СЛАБОЕ ЗВЕНО!');
		
	},
			
	set_bank_level(bank_level,bank_total){
		
		if (bank_total)
			objects.t_total_bank.text=bank_total;
		
		objects.bank_points.forEach(p=>p.bcg.texture=gres.bank_point_bcg.texture)		
		objects.bank_points[bank_level].bcg.texture=gres.cur_bank_point_bcg.texture;
		
	},
	
	super_game_start_event(){
		
		this.num_of_questions=5;
		this.cur_question=1;
		
		//показываем сообщение
		host.add_msg('ИНФО','НАЧИНАЕМ СУПЕР ИГРУ!');
				
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
					host.add_msg('ИНФО','ПОЗДРАВЛЯЮ С ПОБЕДОЙ! ВАШ ВЫИГРЫШ: '+total_bank);
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
		if (data.cor)			
			objects.player_ans_bcg.tint=0xffffff;			
		else			
			objects.player_ans_bcg.tint=0xff0000;			
		
		//показываем ответ
		objects.player_ans_cont.x=card.x+35;		
		anim2.add(objects.player_ans_cont,{alpha:[0,1]}, false, 4,'easeBridge');
	},
	
	show_status_window(t){
		
		objects.t_table_status0.text=t||'...';
		
		//сразу сколько игроков есть в pending
		fbs.ref(room_id+'/pending').on('value',data=>{
			game.show_pending_players(data.val());	
		})
		
		if (objects.bank_cont.visible)
			anim2.add(objects.bank_cont,{x:[0,-100]}, true, 0.5,'linear');	
				
		//показываем окошко статуса
		anim2.add(objects.table_status_cont,{y:[450,objects.table_status_cont.sy]}, true, 0.2,'linear');	
	},
		
	close_status_window(){
		
		//сразу сколько игроков есть в pending
		fbs.ref(room_id+'/pending').off();
		
		//показываем окошко статуса
		anim2.add(objects.table_status_cont,{y:[objects.table_status_cont.y,450]}, false, 0.2,'linear');		
	},
		
	show_pending_players(players){
		
		if(!players) return;
		
		const num_of_players=Object.keys(players).length;
		objects.t_table_status1.text=['Игроков онлайн: ','Players online: '][LANG]+num_of_players;
	},
		
	async analyse_table(){	

		const info=await fbs_once(room_id+'/info');

		if (info.state==='no_game'){
			this.show_status_window('Ждем игроков...');
			return;
		}
		
		this.show_status_window('Ждите завершения игры...');
				
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
			this.uid_to_pcards[uid].t_rating.text=rating||100;
			this.uid_to_pcards[uid].rating=rating||100;
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
		
		if (objects.table_status_cont.visible){
			
			objects.table_status_circle.rotation+=0.2;				
			objects.table_status_pic.scale_y=Math.sin(game_tick)*0.666;
		}
		
		
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
		this.set_bank_level(0);
	},
	
	exit_button_down(){
		
		if(anim2.any_on())return;
		this.close();
		main_menu.activate();
		
	},
		
	bank_opt_down(e){
				
		//координаты нажатия в плостоки спрайта клавиатуры
		let mx = e.data.global.x/app.stage.scale.x - objects.host_bank_ask.x;
		
		//если кликнули на банк
		if (mx<190)
			fbs.ref(room_id+'/players_actions').set({uid:my_data.uid,type:'put_bank',tm:Date.now()})
		
		//завершаем
		host.bank_resolver('ok');
		
	},

	stop(res){
		
		
		
		
	},

	close(){
		
		game.first_event=1;		
		
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
		
		if ((Date.now() - this.prv_show) < 100000 )
			return;
		this.prv_show = Date.now();
		
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
	//x,y,x2,y2
	keys_data:[[497.61,9.38,547.27,46.88,'<<'],[13.73,9.38,46.04,46.88,'Й'],[53.44,9.38,85.75,46.88,'Ц'],[93.15,9.38,125.46,46.88,'У'],[132.85,9.38,165.16,46.88,'К'],[172.56,9.38,204.87,46.88,'Е'],[212.27,9.38,244.58,46.88,'Н'],[251.97,9.38,284.28,46.88,'Г'],[291.68,9.38,323.99,46.88,'Ш'],[331.39,9.38,363.7,46.88,'Щ'],[371.09,9.38,403.4,46.88,'З'],[410.8,9.38,443.11,46.88,'Х'],[450.51,9.38,482.82,46.88,'Ъ'],[13.73,53.44,49.65,90.94,'Ф'],[57.05,53.44,92.97,90.94,'Ы'],[100.37,53.44,136.29,90.94,'В'],[143.68,53.44,179.6,90.94,'А'],[187,53.44,222.92,90.94,'П'],[230.32,53.44,266.24,90.94,'Р'],[273.63,53.44,309.55,90.94,'О'],[316.95,53.44,352.87,90.94,'Л'],[360.27,53.44,396.19,90.94,'Д'],[403.58,53.44,439.5,90.94,'Ж'],[446.9,53.44,482.82,90.94,'Э'],[70.79,97.5,103.66,135,'Я'],[111.05,97.5,143.92,135,'Ч'],[151.31,97.5,184.18,135,'С'],[191.58,97.5,224.45,135,'М'],[231.84,97.5,264.71,135,'И'],[272.11,97.5,304.98,135,'Т'],[312.37,97.5,345.24,135,'Ь'],[352.64,97.5,385.51,135,'Б'],[392.9,97.5,425.77,135,'Ю'],[500.78,98.44,550.44,135.94,'OK']],
	
	open(){		
		
		objects.keyboard_text.text='';
		anim2.add(objects.keyboard_cont,{y:[450, objects.keyboard_cont.sy]}, true, 0.5,'linear');
		
		return new Promise(resolve=>{			
			keyboard.resolver=resolve;			
		})
		
		
	},
		
	close(){
		
		anim2.add(objects.keyboard_cont,{y:[objects.keyboard_cont.y,450]}, false, 0.5,'linear');
		
	},
		
	keydown(key){				
		
		//*******это нажатие с клавиатуры
		key = key.toUpperCase();
		sound.play('keypress');
				
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
		
	pointerdown(e, inp_key){
		
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
		
			this.resolver(objects.keyboard_text.text);			
			objects.keyboard_text.text=''
			return;
		}		

		//добавляем значение к слову
		objects.keyboard_text.text+=key;
		
	}
		
}

tables_menu={
	
	payments:null,
	
	activate(){
		
		
		anim2.add(objects.table1_data_cont,{x:[-50,objects.table1_data_cont.sx]}, true, 0.25,'linear');
		anim2.add(objects.table2_data_cont,{x:[850,objects.table2_data_cont.sx]}, true, 0.25,'linear');
		
		fbs.ref('room1/pending').on('value',function(data){			
			tables_menu.table_data_updated(objects.t_table1_players_num,data.val())
		})
		
		fbs.ref('room2/pending').on('value',function(data){			
			tables_menu.table_data_updated(objects.t_table2_players_num,data.val())
		})
		
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
	
	buy_chips_down(){
		
		this.payments.purchase({ id: 'chips1000' }).then(purchase => {
			objects.table_menu_info.text=['Вы купили 1000 фишек!','you bought 1000 chips!'][LANG];
		}).catch(err => {
			objects.table_menu_info.text=['Ошибка при покупке!','Error!'][LANG];
		})
		
	},
	
	table_down(room){
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		/*if(table==='table2'){
			anim2.add(objects.table2_data_cont,{x:[objects.table2_data_cont.sx,objects.table2_data_cont.sx+5]}, true, 0.25,'shake');
			sound.play('locked');
			return;
		}*/
		
		room_id=room;
		game.activate();
		this.close();
		
	},	
	
	close(){
		
		fbs.ref('table1/pending').off();
		fbs.ref('table2/pending').off();	
		
		anim2.add(objects.table1_data_cont,{x:[objects.table1_data_cont.x,-50]}, false, 0.25,'linear');
		anim2.add(objects.table2_data_cont,{x:[objects.table2_data_cont.x,850]}, false, 0.25,'linear');
		
	}
	
}

main_menu= {

	async activate() {

		anim2.add(objects.mb_cont,{x:[800,objects.mb_cont.sx]}, true, 1,'easeInOutCubic');
		anim2.add(objects.game_title,{y:[-300,objects.game_title.sy]}, true, 1,'easeInOutCubic');
		objects.desktop.texture = gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.6,'linear');
	},
	

	async close() {

		objects.mb_cont.visible=false;
		some_process.main_menu_process = function(){};
		anim2.add(objects.mb_cont,{x:[objects.mb_cont.x,800]}, true, 1,'easeInOutCubic');
		anim2.add(objects.game_title,{y:[objects.game_title.y,-300]}, true, 1,'linear');
		//await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.6,'linear');	
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

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
	
		await this.close();
		rules.activate();


	},

	rules_ok_down() {

		anim2.add(objects.rules_cont,{y:[objects.rules_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

}

lb = {
	
	active : 0,
	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],

	show: function() {

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

	close: async function() {

		this.active = 0;
		anim2.add(objects.leader_header,{y:[objects.leader_header.y,-50]}, true, 0.5,'easeInBack');
		anim2.add(objects.lb_1_cont,{x:[objects.lb_1_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_2_cont,{x:[objects.lb_2_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_3_cont,{x:[objects.lb_3_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_cards_cont,{x:[objects.lb_cards_cont.x, 450]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_back_button,{x:[objects.lb_back_button.x, 800]}, false, 0.5,'easeInBack');
		await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.6,'linear');		

	},

	back_button_down: async function() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
		await this.close();
		main_menu.activate();

	},

	update: function () {

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

rules = {
	
	active : 0,
	
	activate : function() {
		
		this.active = 1;
		anim2.add(objects.desktop,{alpha:[0,0.5]}, true, 0.6,'linear');	
		anim2.add(objects.rules_back_button,{x:[800, objects.rules_back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.rules_text,{alpha:[0, 1]}, true, 1,'linear');
				
		objects.rules_text.text = ['Добро пожаловать в карточную игру Покер (онлайн дуэль)!\n\nВ игре участвуют до 6 игроков. Цель игры - составить лучшую пятикарточную покерную комбинацию из своих и общих карт. В игре несколько раундов, в течении которых игроки делают ставки. После каждого раунда открывается одна или три (на префлопе) карты. Когда все карты открыты, объявляется победитель - тот, у кого сложилась более сильная комбинация карт, и он забирает банк (pot). Также можно выиграть банк если соперники откажутся продолжать партию (скинут карты). Выиграть можно также вводя соперников в заблуждение величиной ставок (блеф) и тем самым заставляя их скидывать карты.\n\nУдачной игры!','Welcome to the Poker card game (online)!\n\n The game involves up to 6 players. The goal of the game is to make the best five-card poker combination of your own and community cards. There are several rounds in the game, during which players place bets. After each round, one or three (preflop) cards are opened. When all the cards are open, the winner is announced - the one who has a stronger combination of cards, and he takes the pot. You can also win the pot if the opponent refuses to continue the game (throws off the cards). You can also win by misleading your opponent with the amount of bets (bluff) and thereby forcing him to fold his cards.\n\nHave a good game!'][LANG];
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

auth2 = {
		
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
			alert('Неизвестная платформа. Кто Вы?')
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
		
		//game.sound_switch_down(0);
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

	let git_src="https://akukamil.github.io/poker/"
	git_src=""

	//подпапка с ресурсами
	let lang_pack = ['RUS','ENG'][LANG];
	

	game_res=new PIXI.Loader();
	
	
	game_res.add("m2_font", git_src+"fonts/Bahnschrift/font.fnt");

	game_res.add('check',git_src+'sounds/check.mp3');
	game_res.add('raise',git_src+'sounds/raise.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('win',git_src+'sounds/win.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('confirm_dialog',git_src+'sounds/confirm_dialog.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('clock',git_src+'sounds/clock.mp3');
	game_res.add('card',git_src+'sounds/card.mp3');
	game_res.add('card_open',git_src+'sounds/card_open.mp3');
	game_res.add('dialog',git_src+'sounds/dialog.mp3');
	game_res.add('keypress',git_src+'sounds/keypress.mp3');
	game_res.add('inst_msg',git_src+'sounds/inst_msg.mp3');
	game_res.add('fold',git_src+'sounds/fold.mp3');
	game_res.add('money',git_src+'sounds/money.mp3');
	
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
		LANG = await language_dialog.show();
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
	LANG = await language_dialog.show();
	
	

}

async function check_blocked(){
	
	//загружаем остальные данные из файербейса
	const block_data = await fbs_once('blocked/' + my_data.uid);
	if (block_data) my_data.blocked=1;
	
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
	window.addEventListener('keydown', function(event) { keyboard.keydown(event.key)});
		
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
