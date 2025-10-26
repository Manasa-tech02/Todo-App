import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  ImageBackground,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import 'react-native-get-random-values';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { SafeAreaView } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}


interface AddTodoFormProps {
  onAdd: (text: string) => void;
}

const AddTodoForm = ({ onAdd }: AddTodoFormProps) => {
  const [text, setText] = useState('');

  const handleAddPress = () => {
    if (text.trim()) {
      onAdd(text);
      setText('');
      
    }
  };

  return (
    <View style={formStyles.container}>
      <TextInput
        style={formStyles.input}
        placeholder="Add a new task..."
        value={text}
        onChangeText={setText}
        //onSubmitEditing={handleAddPress}
        
      />
      <Button title="Add" onPress={handleAddPress} />
    </View>
  );
};


interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  return (
    <View style={itemStyles.container}>
      <Switch
        value={todo.completed}
        onValueChange={() => onToggle(todo.id)}
        
      /> 
      <Text style={[itemStyles.text, todo.completed && itemStyles.completedText]}>
        {todo.text}
      </Text>
      <TouchableOpacity onPress={() => onDelete(todo.id)} style={itemStyles.deleteButton}>
        <Text style={itemStyles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};





const TODOS_STORAGE_KEY = '@todo_app_todos';

export default function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isReady, setIsReady] = useState(false);

 
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);


  useEffect(() => {     
    const loadTodos = async () => { // async means this function needs to do something that takes time.
      
        const storedTodos = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
        if (storedTodos !== null) {
          setTodos(JSON.parse(storedTodos));
        }else{
          setIsReady(true);

        }
       
        
       
       
      
    };
    loadTodos();
  }, []); // the empty bracket mean this runs the code inside this only once

 
  useEffect(() => {
    const saveTodos = async () => {
      if (!isReady) return;
      
        await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
      
    };
    saveTodos();
  }, [todos, isReady]);


  const handleAddTodo = (text: string) => {
    const newTodo: Todo = { id: uuidv4(), text, completed: false };
    setTodos(prevTodos => [...prevTodos, newTodo]);
  };

 
  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleRequestDelete = (id: string) => {
    setTodoToDelete(id); // Remember which ID to delete
    setIsModalVisible(true); // Open the modal
  };

  
  const handleDeleteTodo = () => {
    if (todoToDelete) {
      setTodos(todos.filter(todo => todo.id !== todoToDelete));
    }
    setIsModalVisible(false); 
    setTodoToDelete(null); 
  };

  
  const handleCancelDelete = () => {
    setIsModalVisible(false);
    setTodoToDelete(null);
  };

  return (
    <ImageBackground source={require("@/assets/images/TodoBg.png")} style={styles.image}>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.titleContainer}>
         <Text style={styles.title}>My Todo List</Text>
         <FontAwesome6 name="file-pen" size={30} color="rgba(236, 237, 244, 1)" style={styles.icon} />
       

      </View>
      




 
        

      <AddTodoForm onAdd={handleAddTodo} />

      <FlatList
        data={todos}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={handleToggleTodo}
           
            onDelete={handleRequestDelete}
          />
        )}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet. Add one!</Text>
            
          </View>
        }
      />

 
      <Modal
        visible={isModalVisible}
        transparent={true} // So we can see the app behind it
        animationType="slide"
        onRequestClose={handleCancelDelete} // For the Android back button
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you sure you want to delete this task?
            </Text>
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={handleCancelDelete} color="#999" />
              <Button title="Delete" onPress={handleDeleteTodo} color="#ff3b30" />
            </View>
          </View>
        </View>
      </Modal>
     
    </SafeAreaView>
    </ImageBackground>
  );
}



  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: 'rgba(237, 11, 11, 1)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    
  },
  titleContainer: {
    flexDirection: 'row',     
    alignItems: 'center',     
    justifyContent: 'center', 
    marginVertical: 30,       
  },
  
  title: {
    fontSize: 32,     
    fontWeight: 'bold',
    textAlign: 'center',
    //marginVertical: 30,
    color: 'rgba(2, 0, 14, 1)',
    
  },


  icon:{
    marginLeft:10,

  },
  list: {
    flex: 1,
    
  },
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(97, 70, 70, 1)',
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  image:{
    flex:1,
    
    width:"100%"
  }
});

const formStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
   
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
  
    fontSize: 16,
  },


  
});

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    
  },
  text: {
    flex: 1,
    fontSize: 18,
    marginLeft: 12,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
    
  },
  deleteText: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
  },


});


